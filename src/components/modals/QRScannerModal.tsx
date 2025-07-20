import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useMemo, useState } from 'react';
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
import {
  Camera,
  CodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';
import { Image } from 'react-native';
import { useTCP } from '../../service/TCPProvider';
import { navigate } from '../../utils/NavigationUtil';
interface ModalProps {
  visible: boolean;
  onClose: () => void;
}
const QRScannerModal: FC<ModalProps> = ({ visible, onClose }) => {
  const { isConnected, server, connectToServer } = useTCP();
  const [loading, setLOading] = useState(true);
  const [codeFound, setCodeFound] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back') as any;
  const shimmerTranslateX = useSharedValue(-300);

  useEffect(() => {
    const checkPermission = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    };
    checkPermission();
    if (visible) {
      setLOading(true);
      const timer = setTimeout(() => {
        setLOading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [shimmerTranslateX]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: shimmerTranslateX.value,
        },
      ],
    };
  });

  const codeScanner = useMemo<CodeScanner>(
    () => ({
      codeTypes: ['qr', 'codabar'],
      onCodeScanned: (codes: string | any[]) => {
        if (codeFound) {
          return;
        }
        if (codes.length > 0) {
          const scannedData = codes[0].value;
          setCodeFound(true);
          handleScan(scannedData);
        }
      },
    }),
    [codeFound],
  );

  const handleScan = (data: any) => {
    const [connectionData, deviceName] = data.replace('tcp://', '').split('|');
    const [host, port] = connectionData?.split(':');

    //connectToServer
    connectToServer(host, parseInt(port, 10), deviceName);
  };

  useEffect(() => {
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

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
          {loading ? (
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
            <>
              {!device || !hasPermission ? (
                <View style={modalStyles.skeleton}>
                  <Image
                    source={require('../../assets/images/no_camera.png')}
                    style={modalStyles.noCameraImage}
                  />
                </View>
              ) : (
                <View style={modalStyles.skeleton}>
                  <Camera
                    style={modalStyles.camera}
                    isActive={visible}
                    device={device}
                    codeScanner={codeScanner}
                  />
                </View>
              )}
            </>
          )}
        </View>
        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure your're on the same WI-Fi network
          </CustomText>
          <CustomText style={modalStyles.infoText1}>
            Ask the receiver to show a QR code to connect and transfer files
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

export default QRScannerModal;

const styles = StyleSheet.create({});
