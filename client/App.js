import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { PlayerProvider } from './src/context/PlayerContext';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const hideSystemUI = async () => {
      try {
        StatusBar.setHidden(true, 'fade');
        if (Platform.OS === 'android') {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }
      } catch (e) {
        console.warn('[Global Immersion Error]', e);
      }
    };
    hideSystemUI();
  }, []);

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PlayerProvider>
          {!isSplashComplete && <SplashScreen onFinish={() => setIsSplashComplete(true)} />}
          <TabNavigator />
        </PlayerProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
