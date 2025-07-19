import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { commonStyles } from '../styles/commonStyles';
import HomeHeader from '../components/home/HomeHeader';
import Misc from '../components/home/Misc';
import Options from '../components/home/Options';
import SendReceiveButton from '../components/home/SendReceiveButton';
import AbsoluteQRBottom from '../components/home/AbsoluteQRBottom';

const HomeScreen = () => {
  return (
    <View style={commonStyles.baseContainer}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, padding: 15 }}
        showsHorizontalScrollIndicator={false}
      >
        <SendReceiveButton />
        <Options isHome />
        <Misc />
      </ScrollView>
      <AbsoluteQRBottom />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
