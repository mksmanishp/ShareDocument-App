import { StyleSheet } from 'react-native';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '../utils/NavigationUtil';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import SendScreen from '../screens/SendScreen';
import ConnectionScreen from '../screens/ConnectionScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import ReceivedFileScreen from '../screens/ReceivedFileScreen';
import { TCPProvider } from '../service/TCPProvider';

const Stack = createNativeStackNavigator();
const Navigation = () => {
  return (
    <TCPProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="SplashScreen"
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="SendScreen"
            component={SendScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="ConnectionScreen"
            component={ConnectionScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="ReceiveScreen"
            component={ReceiveScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="ReceivedFileScreen"
            component={ReceivedFileScreen}
            options={{ animation: 'fade' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TCPProvider>
  );
};

export default Navigation;

const styles = StyleSheet.create({});
