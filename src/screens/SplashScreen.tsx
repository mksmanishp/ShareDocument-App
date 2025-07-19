import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import React, { FC, useEffect } from 'react';
import { commonStyles } from '../styles/commonStyles';
import { navigate, resetAndNavigate } from '../utils/NavigationUtil';

const SplashScreen: FC = () => {
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      navigateToHome();
    }, 2500);
    return () => clearTimeout(timeOutId);
  }, []);

  const navigateToHome = () => {
    navigate('HomeScreen');
  };

  return (
    <ImageBackground
      source={require('../assets/images/bg.png')}
      style={commonStyles.container}
    >
      <Image
        source={require('../assets/images/logo_t.png')}
        style={commonStyles.img}
      />
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
