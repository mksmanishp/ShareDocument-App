import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { modalStyles } from '../../styles/modalStyles';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { multiColor } from '../../utils/Constants';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';
import { useTCP } from '../../service/TCPProvider';
import { getLocalIPAddress } from '../../utils/networkUtils';
import DeviceInfo from 'react-native-device-info';
import { navigate } from '../../utils/NavigationUtil';
interface ModalProps {
  visible: boolean;
  onClose: () => void;
}
const QRGenerateModel: FC<ModalProps> = ({ visible, onClose }) => {
  const { isConnected, startServer, server } = useTCP();

  const [loading, setLOading] = useState(true);
  const [qrValue, setQRValue] = useState('Manish');
  const shimmerTranslateX = useSharedValue(-300);

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress(); // Make sure getLocalIPAddress is correctly imported
    const port = 4000;

    if (!server) {
      startServer(port);
    }

    setQRValue(`tcp://${ip}:${port}|${deviceName}`);
    console.log(`Server info: ${ip}:${port}`);
  };

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
    if (visible) {
      setLOading(true);
      setupServer();
    }
  }, [visible]);

  useEffect(() => {
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: shimmerTranslateX.value,
        },
      ],
    };
  });

  useEffect(() => {}, []);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.qrContainer}>
          {loading || qrValue === null || qrValue == '' ? (
            <View style={modalStyles.skeleton}>
              <Animated.View style={[modalStyles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={['#f3f3f3', '#fff', '#f3f3f3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={modalStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <QRCode
              value={qrValue}
              size={250}
              logoSize={60}
              logoBackgroundColor="#fff"
              logoMargin={2}
              logoBorderRadius={10}
              logo={require('../../assets/images/profile.jpg')}
              enableLinearGradient
              linearGradient={multiColor}
            />
          )}
        </View>
        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure your're on the same WI-Fi network
          </CustomText>
          <CustomText style={modalStyles.infoText1}>
            Ask the sender to scan this QR code to connect and transfer files
          </CustomText>
        </View>
        <ActivityIndicator
          size={'small'}
          color={'#000'}
          style={{ alignSelf: 'center' }}
        />
        <TouchableOpacity
          onPress={() => onClose()}
          style={modalStyles.closeButton}
        >
          <Icon
            iconFamily="Ionicons"
            name="close"
            size={24}
            color="rgba(226, 14, 53, 1)"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default QRGenerateModel;

const styles = StyleSheet.create({});
