import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  interpolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Particle = ({ index }) => {
  const tx = useSharedValue(Math.random() * width);
  const ty = useSharedValue(Math.random() * height);
  const opacity = useSharedValue(Math.random() * 0.5);

  useEffect(() => {
    tx.value = withRepeat(
      withTiming(tx.value + (Math.random() - 0.5) * 100, { duration: 5000 + Math.random() * 5000 }),
      -1,
      true
    );
    ty.value = withRepeat(
      withTiming(ty.value - 100, { duration: 8000 + Math.random() * 4000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.particle, 
        animatedStyle,
        { width: 2 + Math.random() * 2, height: 2 + Math.random() * 2 }
      ]} 
    />
  );
};

const AnimeBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A192F', '#050C16']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Particle Effects (Dust Motes) */}
      {[...Array(20)].map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      {/* Film Grain Overlay Placeholder */}
      <View style={[styles.grain, { opacity: 0.03 }]} pointerEvents="none" />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#F1E5AC',
    borderRadius: 10,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  }
});

export default AnimeBackground;
