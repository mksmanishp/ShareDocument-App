import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { useTCP } from '../service/TCPProvider';
import Icon from '../components/global/Icon';
import { resetAndNavigate } from '../utils/NavigationUtil';
import LinearGradient from 'react-native-linear-gradient';
import { sendStyles } from '../styles/sendStyles';
import { connectionStyles } from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import Options from '../components/home/Options';
import { formatFileSize } from '../utils/libraryHelpers';
import { Colors } from '../utils/Constants';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ConnectionScreen: FC = () => {
  const {
    connectedDevice,
    disconnect,
    sendFileAck,
    sentFiles,
    receivedFiles,
    totalReceivedBytes,
    totalSentBytes,
    isConnected,
  } = useTCP();

  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('SENT');

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case '.mp3':
        return (
          <Icon
            name="musical-notes"
            size={16}
            color="blue"
            iconFamily="Ionicons"
          />
        );
      case '.mp4':
        return (
          <Icon name="videocam" size={16} color="green" iconFamily="Ionicons" />
        );
      case '.jpg':
        return (
          <Icon name="image" size={16} color="orange" iconFamily="Ionicons" />
        );
      case '.pdf':
        return (
          <Icon name="document" size={16} color="red" iconFamily="Ionicons" />
        );
      default:
        return (
          <Icon name="folder" size={16} color="gray" iconFamily="Ionicons" />
        );
    }
  };

  const onMediaPickedUp = (image: any) => {
    sendFileAck(image, 'image');
  };

  const onFilePickedUp = (file: any) => {
    sendFileAck(file, 'file');
  };

  useEffect(() => {
    if (!isConnected) {
      resetAndNavigate('HomeScreen');
    }
  }, [isConnected]);

  const handleTabChange = (tab: 'SENT' | 'RECEIVED') => {
    setActiveTab(tab);
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={connectionStyles.fileItem}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles?.fileDetails}>
            <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={10}>
              {item?.name}
            </CustomText>
            <CustomText>
              {item?.mimeType} • {formatFileSize(item.size)}
            </CustomText>
          </View>
        </View>
        {item?.avilable ? (
          <TouchableOpacity
            style={connectionStyles.openButton}
            onPress={() => {
              const normalizedPath =
                Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;

              if (Platform.OS === 'ios') {
                ReactNativeBlobUtil.ios
                  .openDocument(normalizedPath)
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file:', err));
              } else {
                ReactNativeBlobUtil.android
                  .actionViewIntent(normalizedPath, '*/*')
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file:', err));
              }
            }}
          >
            <CustomText
              numberOfLines={1}
              fontFamily="Okra-Bold"
              fontSize={9}
              color="#fff"
            >
              open
            </CustomText>

            {/* Button content (e.g., icon/text) goes here */}
          </TouchableOpacity>
        ) : (
          <ActivityIndicator color={Colors.primary} size={'small'} />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={sendStyles.mainContainer}
    >
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={connectionStyles.container}>
          <View style={connectionStyles.connectionContainer}>
            <View style={{ width: '55%' }}>
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Medium"
                fontSize={8}
              >
                Connected With
              </CustomText>
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={14}
              >
                {connectedDevice || 'UnKnown'}
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => disconnect()}
              style={connectionStyles.disconnectButton}
            >
              <Icon
                name="remove-circle"
                size={12}
                color="red"
                iconFamily="Ionicons"
              />
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={10}
              >
                Disconnect
              </CustomText>
            </TouchableOpacity>
          </View>
          <Options
            onMediaPickedUp={onMediaPickedUp}
            onFilePickedUp={onFilePickedUp}
          />
          <View style={connectionStyles.fileContainer}>
            <View style={connectionStyles.sendReceiveContainer}>
              <TouchableOpacity
                onPress={() => handleTabChange('SENT')}
                style={[
                  connectionStyles.sendReceiveButton,
                  activeTab === 'SENT'
                    ? connectionStyles.activeButton
                    : connectionStyles.inactiveButton,
                ]}
              >
                <Icon
                  name="cloud-upload"
                  size={12}
                  color={activeTab === 'SENT' ? '#fff' : 'blue'}
                  iconFamily="Ionicons"
                />
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Bold"
                  fontSize={9}
                  color={activeTab === 'SENT' ? '#fff' : '#000'}
                >
                  SENT
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange('RECEIVED')}
                style={[
                  connectionStyles.sendReceiveButton,
                  activeTab === 'RECEIVED'
                    ? connectionStyles.activeButton
                    : connectionStyles.inactiveButton,
                ]}
              >
                <Icon
                  name="cloud-upload"
                  size={12}
                  color={activeTab === 'RECEIVED' ? '#fff' : 'blue'}
                  iconFamily="Ionicons"
                />
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Bold"
                  fontSize={9}
                  color={activeTab === 'RECEIVED' ? '#fff' : '#000'}
                >
                  RECEIVED
                </CustomText>
              </TouchableOpacity>
            </View>
            {(activeTab === 'SENT'
              ? sentFiles?.length
              : receivedFiles?.length) > 0 ? (
              <FlatList
                data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={connectionStyles.fileList}
              />
            ) : (
              <View style={connectionStyles.noDataContainer}>
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Medium"
                  fontSize={11}
                >
                  {activeTab === 'SENT'
                    ? 'No files sent yet.'
                    : 'No files received yet.'}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => resetAndNavigate('HomeScreen')}
          style={sendStyles.backButton}
        >
          <Icon
            name="arrow-back"
            size={16}
            color="#000"
            iconFamily="Ionicons"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ConnectionScreen;

const styles = StyleSheet.create({});
