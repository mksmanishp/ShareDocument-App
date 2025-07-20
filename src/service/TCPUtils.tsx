import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { Alert } from 'react-native';
import { useChunkStore } from '../components/db/chunkStorage';

export const receiveFileAck = async (
  data: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const { setChunkStore, chunkStore } = useChunkStore.getState();

  if (chunkStore) {
    Alert.alert('There are file which need to be received wait please');
    return;
  }
  setReceivedFiles((prevData: any) => {
    produce(prevData, (draft: any) => {
      draft.push(data);
    });
  });
  setChunkStore({
    id: data?.id,
    totalChunks: data?.totalChunks,
    name: data?.name,
    size: data?.size,
    mimeType: data?.mimeType,
    chunkArray: [],
  });
  if (!socket) {
    console.log('socket not available');
    return;
  }
  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    socket.write(JSON.stringify({ event: 'send_chunk_ack', chunkNo: 0 }));
  } catch (error) {
    console.log('error sending', error);
  }
};

export const sendChunkAck = async (
  chunkIndex: any,
  socket: any,
  setTotalSentBytes: any,
  setSentFiles: any,
) => {
  const { currentChunkSet, resetCurrentChunkSet } = useChunkStore.getState();
  if (!currentChunkSet) {
    Alert.alert('There are no chunk to be sent');
    return;
  }
  if (!socket) {
    console.log('socket not avilable');
    return;
  }
  const totalChunks = currentChunkSet?.totalChunks;

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: currentChunkSet?.chunkArray[chunkIndex].toString('base64'),
        chunkNo: chunkIndex,
      }),
    );

    setTotalSentBytes(
      (prev: number) => prev + currentChunkSet.chunkArray[chunkIndex]?.length,
    );

    if (chunkIndex + 2 > totalChunks) {
      console.log('ALL CHUNKS SENT SUCCESSFULLY 🧠🍎');
      setSentFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f.id === currentChunkSet.id,
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex].available = true;
          }
        }),
      );
      resetCurrentChunkSet();
    }
  } catch (error) {
    console.error('Error Sending File:', error);
  }
};

export const receiveChunkAck = async (
  chunk: any,
  chunkNo: number,
  socket: any,
  setTotalReceivedBytes: any,
  generateFile: any,
) => {
  const { chunkStore, setChunkStore, resetChunkStore } =
    useChunkStore.getState();

  if (!chunkStore) return;

  try {
    const bufferChunk = Buffer.from(chunk, 'base64');
    const updatedChunkArray = [...(chunkStore.chunkArray || [])];
    updatedChunkArray[chunkNo] = bufferChunk;

    setChunkStore({
      ...chunkStore,
      chunkArray: updatedChunkArray,
    });

    setTotalReceivedBytes(
      (prevValue: number) => prevValue + bufferChunk.length,
    );
  } catch (error) {
    console.log('error updating chunk', error);
  }

  if (!socket) {
    console.log('Socket not available');
    return;
  }

  if (chunkNo + 1 === chunkStore?.totalChunks) {
    console.log('All Chunks Received ✅ 🔴');
    generateFile();
    resetChunkStore();
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('REQUESTED FOR NEXT CHUNK ⬇️', chunkNo + 1);
    socket.write(
      JSON.stringify({ event: 'send_chunk_ack', chunkNo: chunkNo + 1 }),
    );
  } catch (error) {
    console.error('Error sending file:', error);
  }
};
