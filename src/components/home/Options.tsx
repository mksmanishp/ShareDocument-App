import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import { optionStyles } from '../../styles/optionsStyles';
import Icon from '../global/Icon';
import { Colors } from '../../utils/Constants';
import CustomText from '../global/CustomText';
import { useTCP } from '../../service/TCPProvider';
import { navigate } from '../../utils/NavigationUtil';
import { pickDocument, pickImage } from '../../utils/libraryHelpers';

const Options: FC<{
  isHome?: boolean;
  onMediaPickedUp?: (media: any) => void;
  onFilePickedUp?: (file: any) => void;
}> = ({ isHome, onFilePickedUp, onMediaPickedUp }) => {
  const { isConnected } = useTCP();

  const handleUniveralPicker = async (type: string) => {
    if (isHome) {
      if (isConnected) {
        navigate('ConnectionScreen');
      } else {
        navigate('SendScreen');
      }
      return;
    }

    if (type === 'image' && onMediaPickedUp) {
      pickImage(onMediaPickedUp);
    }

    if (type === 'file' && onFilePickedUp) {
      pickDocument(onFilePickedUp);
    }
  };

  return (
    <View style={optionStyles.container}>
      <TouchableOpacity
        style={optionStyles.subContainer}
        onPress={() => handleUniveralPicker('images')}
      >
        <Icon
          name="images"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={20}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          Photo
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={optionStyles.subContainer}
        onPress={() => handleUniveralPicker('file')}
      >
        <Icon
          name="musical-notes-sharp"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={20}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          Audio
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={optionStyles.subContainer}
        onPress={() => handleUniveralPicker('file')}
      >
        <Icon
          name="folder-open"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={20}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          Files
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={optionStyles.subContainer}
        onPress={() => handleUniveralPicker('file')}
      >
        <Icon
          name="contacts"
          iconFamily="MaterialCommunityIcons"
          color={Colors.primary}
          size={20}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          Contacts
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({});
