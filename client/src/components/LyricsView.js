import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LyricsView = ({ lyrics, position, onSeek }) => {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Height of a single lyric line (consistent for precision scrolling)
  const ITEM_HEIGHT = 80;

  useEffect(() => {
    // Find active line based on current playback position
    const index = lyrics.findIndex((line, i) => {
      const nextLine = lyrics[i + 1];
      return position >= line.timestamp && (!nextLine || position < nextLine.timestamp);
    });

    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
      
      // Use requestAnimationFrame to ensure the list is ready
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5 // Perfectly centers the item in the viewport
        });
      });
    }
  }, [position, lyrics]);

  const renderItem = ({ item, index }) => {
    const isActive = activeIndex === index;
    return (
      <TouchableOpacity 
        onPress={() => onSeek && onSeek(item.timestamp)}
        activeOpacity={0.7}
        style={[styles.line, { opacity: isActive ? 1 : 0.2 }]}
      >
        <Text style={[styles.text, isActive && styles.activeText]}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <FlatList
        ref={flatListRef}
        data={lyrics}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          // Fallback if scroll fails
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true
          });
        }}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        // Optimization: Reduce re-renders
        initialNumToRender={15}
        maxToRenderPerBatch={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    // Proportional padding to allow centering within the player stage
    paddingVertical: 150, 
    paddingHorizontal: 30,
  },
  line: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F1E5AC',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  activeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1E5AC',
    textShadowColor: 'rgba(241, 229, 172, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  }
});

export default LyricsView;
