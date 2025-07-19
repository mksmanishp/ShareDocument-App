import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { commonStyles } from '../styles/commonStyles';
import HomeHeader from '../components/home/HomeHeader';

const HomeScreen = () => {
  return (
    <View style={commonStyles.baseContainer}>
      <HomeHeader />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
