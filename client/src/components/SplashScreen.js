import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  Easing,
  runOnJS,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const orbScale = useSharedValue(0.8);
  const orbOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // Phase 1: The Awakening (Orb materializes)
    orbOpacity.value = withTiming(1, { duration: 1500 });
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Phase 2: The Proclamation (Text appears)
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 1000 });
    }, 1000);

    // Phase 3: The Transition (Final Fade)
    setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 800 }, (finished) => {
        if (finished && onFinish) {
          runOnJS(onFinish)();
        }
      });
    }, 4500);
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [10, 0]) }]
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient 
        colors={['#0A192F', '#050C16', '#000000']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <View style={styles.content}>
        {/* The Celestial Core */}
        <Animated.View style={[styles.orbContainer, orbStyle]}>
          <LinearGradient
            colors={['#F1E5AC', '#D4AF37', 'transparent']}
            style={styles.orb}
          />
          <Music color="#F1E5AC" size={36} style={styles.sparkle} />
        </Animated.View>

        {/* The Proclamation */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.brandTitle}>LPIKS BLOOM</Text>
          <Text style={styles.brandSubtitle}>SOVEREIGN INTERFACE</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CALIBRATING YOUR JOURNEY...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.8,
    shadowColor: '#F1E5AC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  sparkle: {
    position: 'absolute',
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#F1E5AC',
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: 10,
    fontFamily: 'serif',
    marginBottom: 8,
  },
  brandSubtitle: {
    color: 'rgba(241, 229, 172, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    color: 'rgba(241, 229, 172, 0.2)',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
  }
});

export default SplashScreen;
