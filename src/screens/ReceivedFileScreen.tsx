import {
  View,
  Text,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, { FC, useState, useEffect } from 'react';
import RNFS from 'react-native-fs';
import Icon from '../components/global/Icon';
import LinearGradient from 'react-native-linear-gradient';
import { sendStyles } from '../styles/sendStyles';
import CustomText from '../components/global/CustomText';
import { Colors } from '../utils/Constants';
import { connectionStyles } from '../styles/connectionStyles';
import { formatFileSize } from '../utils/libraryHelpers';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { goBack } from '../utils/NavigationUtil';

const ReceivedFileScreen: FC = () => {
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFilesFromDirectory = async () => {
    setIsLoading(true);
    const platformPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/`
        : `${RNFS.DocumentDirectoryPath}/`;

    try {
      const exists = await RNFS.exists(platformPath);
      if (!exists) {
        setReceivedFiles([]);
        return;
      }

      const files = await RNFS.readDir(platformPath);
      const formattedFiles = files.map(file => ({
        id: file.name,
        name: file.name,
        size: file.size,
        uri: file.path,
        mimeType: file.name.split('.').pop() || 'unknown',
      }));
      setReceivedFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setReceivedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesFromDirectory();
  }, []);

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case 'mp3':
        return (
          <Icon
            name="musical-notes"
            size={16}
            color="blue"
            iconFamily="Ionicons"
          />
        );
      case 'mp4':
        return (
          <Icon name="videocam" size={16} color="green" iconFamily="Ionicons" />
        );
      case 'jpg':
        return (
          <Icon name="image" size={16} color="orange" iconFamily="Ionicons" />
        );
      case 'pdf':
        return (
          <Icon name="document" size={16} color="red" iconFamily="Ionicons" />
        );
      default:
        return (
          <Icon name="folder" size={16} color="gray" iconFamily="Ionicons" />
        );
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={connectionStyles.fileItem}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles.fileDetails}>
            <CustomText fontFamily="Okra-Bold" fontSize={10} numberOfLines={1}>
              {item?.name}
            </CustomText>
            <CustomText fontFamily="Okra-Medium" fontSize={8} numberOfLines={1}>
              {item.mimeType} • {formatFileSize(item.size)}
            </CustomText>
          </View>
        </View>
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
            fontFamily="Okra-Bold"
            fontSize={9}
            color="#fff"
            numberOfLines={1}
          >
            Open
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={sendStyles.container}
    >
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={15}
          color="#fff"
          style={{ textAlign: 'center', margin: 10 }}
        >
          All Received Files
        </CustomText>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : receivedFiles.length > 0 ? (
          <FlatList
            data={receivedFiles}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={connectionStyles.fileList}
          />
        ) : (
          <View style={connectionStyles.noDataContainer}>
            <CustomText fontFamily="Okra-Bold" fontSize={11} numberOfLines={1}>
              No files received yet
            </CustomText>
          </View>
        )}

        <TouchableOpacity style={sendStyles.backButton} onPress={goBack}>
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

export default ReceivedFileScreen;
