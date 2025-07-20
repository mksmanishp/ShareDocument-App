import 'react-native-get-random-values';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Alert, Platform } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

import { useChunkStore } from '../components/db/chunkStorage';
import { receiveChunkAck, receiveFileAck, sendChunkAck } from './TCPUtils';

interface FileMeta {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevice: any;
  sentFiles: FileMeta[];
  receivedFiles: any;
  totalSentBytes: number;
  totalReceivedBytes: number;
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  sendMessage: (message: string | Buffer) => void;
  sendFileAck: (file: FileMeta, type: 'file' | 'image') => void;
  disconnect: () => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = (): TCPContextType => {
  const context = useContext(TCPContext);
  if (!context) {
    throw new Error('useTCP must be used within a TCPProvider');
  }
  return context;
};

const options = {
  keystore: require('../../tls_certs/server-keystore.p12'),
};

export const TCPProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [serverSocket, setServerSocket] = useState<any>(null);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [sentFiles, setSentFiles] = useState<any[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
  const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const { currentChunkSet, setCurrentChunkSet, setChunkStore } =
    useChunkStore();

  const disconnect = useCallback(() => {
    if (client) {
      client.destroy();
    }
    if (server) {
      server.close();
    }
    setClient(null);
    setServer(null);
    setServerSocket(null);
    setConnectedDevice(null);
    setSentFiles([]);
    setReceivedFiles([]);
    setCurrentChunkSet(null);
    setTotalReceivedBytes(0);
    setTotalSentBytes(0);
    setChunkStore(null);
    setIsConnected(false);
  }, [client, server]);

  const generateFile = useCallback(async () => {
    const { chunkStore, resetChunkStore } = useChunkStore.getState();

    if (
      !chunkStore ||
      chunkStore?.totalChunks !== chunkStore.chunkArray.length
    ) {
      console.error('Invalid or incomplete chunk data.');
      return;
    }

    try {
      const combinedChunks = Buffer.concat(chunkStore.chunkArray);
      const platformPath =
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath;

      const filePath = `${platformPath}/${chunkStore.name}`;
      await RNFS.writeFile(
        filePath,
        combinedChunks.toString('base64'),
        'base64',
      );

      setReceivedFiles(prevFiles =>
        produce(prevFiles, draft => {
          const idx = draft.findIndex((f: any) => f.id === chunkStore.id);
          if (idx !== -1) {
            draft[idx] = { ...draft[idx], uri: filePath, available: true };
          }
        }),
      );

      resetChunkStore();
      console.log('File saved to:', filePath);
    } catch (err) {
      console.error('File generation error:', err);
    }
  }, []);

  const startServer = useCallback(
    (port: number) => {
      if (server) {
        console.log('Server already running');
        return;
      }

      const newServer = TcpSocket.createTLSServer(options, socket => {
        setServerSocket(socket);
        setIsConnected(true);
        console.log('Client connected:', socket.address());

        socket.setNoDelay(true);
        socket.readableHighWaterMark = 1024 * 1024;
        socket.writableHighWaterMark = 1024 * 1024;

        socket.on('data', async data => {
          const parseData = JSON.parse(data?.toString());
          switch (parseData?.event) {
            case 'connect':
              setConnectedDevice(parseData?.deviceName);
              break;
            case 'file_ack':
              receiveFileAck(parseData?.file, socket, setReceivedFiles);
              break;
            case 'send_chunk_ack':
              sendChunkAck(
                parseData?.chunkNo,
                socket,
                setTotalSentBytes,
                setSentFiles,
              );
              break;
            case 'receive_chunk_ack':
              receiveChunkAck(
                parseData?.chunk,
                parseData?.chunkNo,
                socket,
                setTotalReceivedBytes,
                generateFile,
              );
              break;
          }
        });

        socket.on('close', disconnect);
        socket.on('error', error => console.error('Server error:', error));
      });

      newServer.listen({ port, host: '0.0.0.0' }, () => {
        console.log(`Server started on port ${port}`);
      });

      setServer(newServer);
    },
    [server, disconnect, generateFile],
  );

  const connectToServer = useCallback(
    (host: string, port: number, deviceName: string) => {
      const newClient = TcpSocket.connectTLS(
        {
          host,
          port,
          cert: true,
          ca: require('../../tls_certs/server-cert.pem'),
        },
        () => {
          setIsConnected(true);
          setConnectedDevice(deviceName);
          const myDeviceName = DeviceInfo.getDeviceNameSync();
          newClient.write(
            JSON.stringify({ event: 'connect', deviceName: myDeviceName }),
          );
        },
      );

      newClient.setNoDelay(true);
      newClient.readableHighWaterMark = 1024 * 1024;
      newClient.writableHighWaterMark = 1024 * 1024;

      newClient.on('data', async data => {
        const parseData = JSON.parse(data?.toString());
        switch (parseData?.event) {
          case 'file_ack':
            receiveFileAck(parseData?.file, newClient, setReceivedFiles);
            break;
          case 'send_chunk_ack':
            sendChunkAck(
              parseData?.chunkNo,
              newClient,
              setTotalSentBytes,
              setSentFiles,
            );
            break;
          case 'receive_chunk_ack':
            receiveChunkAck(
              parseData?.chunk,
              parseData?.chunkNo,
              newClient,
              setTotalReceivedBytes,
              generateFile,
            );
            break;
        }
      });

      newClient.on('error', err => {
        console.error('Client error:', err);
        disconnect();
      });

      newClient.on('close', disconnect);
      setClient(newClient);
    },
    [disconnect, generateFile],
  );

  const sendMessage = useCallback(
    (message: string | Buffer) => {
      const socket = client || serverSocket;
      if (!socket) {
        console.error('No active socket to send message');
        return;
      }

      const data =
        typeof message === 'string' ? JSON.stringify(message) : message;
      socket.write(data);
      console.log('Sent:', message);
    },
    [client, serverSocket],
  );

  const sendFileAck = async (file: any, type: 'image' | 'file') => {
    if (currentChunkSet != null) {
      Alert.alert('Wait for current file to be sent!');
      return;
    }

    try {
      const filePath =
        Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
      const fileData = await RNFS.readFile(filePath, 'base64');
      const buffer = Buffer.from(fileData, 'base64');
      const CHUNK_SIZE = 1024 * 8;
      const chunkArray: Buffer[] = [];

      let offset = 0;
      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        chunkArray.push(chunk);
        offset += chunk.length;
      }

      const fileId = uuidv4();
      const fileName = type === 'file' ? file.name : file.fileName;
      const fileSize = type === 'file' ? file.size : file.fileSize;
      const mimeType = type === 'file' ? file.type : 'image/jpeg'; // safer default

      const rawData = {
        id: fileId,
        name: fileName,
        size: fileSize,
        mimeType,
        totalChunks: chunkArray.length,
      };

      setCurrentChunkSet({
        id: fileId,
        chunkArray,
        size: fileSize,
        totalChunks: chunkArray.length,
        mimeType,
      });

      setSentFiles(prev => [...prev, { ...rawData, uri: file.uri }]);

      const socket = client || serverSocket;
      if (!socket) return;

      socket.write(JSON.stringify({ event: 'file_ack', file: rawData }));
      console.log('FILE ACKNOWLEDGE DONE ✅');
    } catch (error) {
      console.error('Error in sendFileAck:', error);
    }
  };

  return (
    <TCPContext.Provider
      value={{
        server,
        client,
        isConnected,
        connectedDevice,
        sentFiles,
        receivedFiles,
        totalSentBytes,
        totalReceivedBytes,
        startServer,
        connectToServer,
        disconnect,
        sendMessage,
        sendFileAck,
      }}
    >
      {children}
    </TCPContext.Provider>
  );
};
