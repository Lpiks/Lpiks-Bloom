import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LyricView = ({ lyrics, currentTime, onSeek }) => {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Find the current active line
    const index = lyrics.findIndex((l, i) => {
      const nextTime = lyrics[i + 1]?.time || Infinity;
      return currentTime >= l.time && currentTime < nextTime;
    });

    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5 // Centers the active line
      });
    }
  }, [currentTime, lyrics]);

  const renderItem = ({ item, index }) => {
    const isActive = index === activeIndex;

    return (
      <TouchableOpacity 
        onPress={() => onSeek(item.time)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.lyricText,
          isActive && styles.activeLyricText
        ]}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={lyrics}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        getItemLayout={(data, index) => ({
          length: 60, // Estimated height per line
          offset: 60 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.5,
    width: '100%',
    marginTop: 20,
  },
  listContent: {
    paddingVertical: SCREEN_HEIGHT * 0.2, // Padding to allow scrolling top/bottom
    paddingHorizontal: 30,
  },
  lyricText: {
    fontSize: 22,
    fontFamily: 'serif', // Elegant Serif choice
    color: 'rgba(241, 229, 172, 0.3)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  activeLyricText: {
    color: '#F1E5AC',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(241, 229, 172, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  }
});

export default LyricView;
