import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image, PanResponder, StatusBar, Platform, Modal, Share } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  useAnimatedReaction,
  runOnJS,
  withTiming
} from 'react-native-reanimated';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MessageSquareText, Heart, X, MoreVertical, Plus, User, Share2, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimeBackground from './AnimeBackground';
import LyricsView from './LyricsView';
import { usePlayer } from '../context/PlayerContext';
import { parseLRC } from '../utils/lrc';
import { fetchLyrics } from '../utils/lyricService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 80;

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SAMPLE_LRC = `[00:00.00] Lpiks Bloom\n[00:05.00] Quiet Luxury Engine`;

const BloomPlayer = () => {
  const { currentTrack, isPlaying, togglePlayPause, position, duration, isFavorited, toggleFavorite, stopTrack, seekTo } = usePlayer();
  
  if (!currentTrack) return null;

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsData, setLyricsData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  
  const expansion = useSharedValue(0); 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setIsScrubbing(true);
        handleScrub(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt, gestureState) => {
        handleScrub(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: (evt, gestureState) => {
        seekTo(scrubPositionRef.current);
        setIsScrubbing(false);
      }
    })
  ).current;

  const scrubPositionRef = useRef(0);
  useEffect(() => {
    scrubPositionRef.current = scrubPosition;
  }, [scrubPosition]);

  const progressAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // Sync animation with position
  useEffect(() => {
    if (!isScrubbing) {
      progressAnim.value = withTiming((position / (duration || 1)) * 100, { duration: 500 });
    } else {
      progressAnim.value = (scrubPosition / (duration || 1)) * 100;
    }
  }, [position, scrubPosition, isScrubbing, duration]);

  // Seeker Bead Pulse
  useEffect(() => {
    pulseAnim.value = withTiming(1.5, { duration: 1500 }, () => {
      pulseAnim.value = withTiming(1, { duration: 1500 });
    });
    const interval = setInterval(() => {
      pulseAnim.value = withTiming(1.5, { duration: 1500 }, () => {
        pulseAnim.value = withTiming(1, { duration: 1500 });
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  const beadStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isScrubbing ? 1.8 : pulseAnim.value) }],
    shadowOpacity: withTiming(isScrubbing ? 1 : 0.6),
  }));

  const handleScrub = (locationX) => {
    const barWidth = SCREEN_WIDTH - 64; 
    const percentage = Math.max(0, Math.min(1, locationX / barWidth));
    const newPos = percentage * (duration || 1);
    setScrubPosition(newPos);
  };

  // Sync state with animation
  useAnimatedReaction(
    () => expansion.value,
    (val) => {
      if (val > 0.8 && !isExpanded) runOnJS(setIsExpanded)(true);
      if (val < 0.2 && isExpanded) runOnJS(setIsExpanded)(false);
    },
    [isExpanded]
  );

  useEffect(() => {
    const loadLyrics = async () => {
      if (currentTrack?.title && currentTrack?.artist) {
        const lrcString = await fetchLyrics(currentTrack.artist, currentTrack.title, duration);
        if (lrcString) {
          setLyricsData(parseLRC(lrcString));
        } else {
          setLyricsData(parseLRC(`[00:00.00] Syncing...`));
        }
      }
    };
    loadLyrics();
  }, [currentTrack]);

  const [showOptions, setShowOptions] = useState(false);

  const handleShare = async () => {
    if (!currentTrack) return;
    try {
      await Share.share({
        message: `Listening to ${currentTrack.title} by ${currentTrack.artist} on Bloom`,
      });
      setShowOptions(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleExpansion = () => {
    expansion.value = withSpring(expansion.value === 0 ? 1 : 0, {
      damping: 20,
      stiffness: 90
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(expansion.value, [0, 1], [MINI_PLAYER_HEIGHT, SCREEN_HEIGHT]),
    bottom: interpolate(expansion.value, [0, 1], [112, 0]), 
    left: interpolate(expansion.value, [0, 1], [20, 0]),
    right: interpolate(expansion.value, [0, 1], [20, 0]),
    borderRadius: interpolate(expansion.value, [0, 1], [16, 0]),
  }));

  const miniPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 0.2], [1, 0]),
    display: expansion.value > 0.5 ? 'none' : 'flex',
  }));

  const fullPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0.8, 1], [0, 1]),
    display: expansion.value < 0.5 ? 'none' : 'flex',
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0F172A', '#0A192F', '#050C16']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* MINI PLAYER ZONE */}
        <Animated.View style={[styles.miniPlayer, miniPlayerStyle]}>
          <LinearGradient
            colors={['#1A2A4A', '#0A192F', '#050C16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.miniGlowBorder} />
          
          <TouchableOpacity 
            onPress={toggleExpansion} 
            activeOpacity={0.9}
            style={styles.miniPlayerTouch}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.miniArtworkContainer}>
                <Image 
                  source={{ uri: currentTrack?.artwork || 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Bloom' }} 
                  style={styles.miniArtwork} 
                />
                <LinearGradient
                  colors={['rgba(241, 229, 172, 0.2)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack?.title || 'Discovery'}</Text>
                <Text style={styles.miniArtist} numberOfLines={1}>{currentTrack?.artist || 'Lpiks bloom'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.miniActionCircle}>
                {isPlaying ? (
                  <Pause size={22} color="#0A192F" fill="#0A192F" />
                ) : (
                  <Play size={22} color="#0A192F" fill="#0A192F" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={stopTrack} style={styles.miniCloseOrb}>
                <X size={16} color="rgba(241, 229, 172, 0.6)" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          {/* Mini Liquid Progress */}
          <View style={styles.miniProgressContainer}>
            <Animated.View style={[styles.miniProgressBar, progressStyle]} />
          </View>
        </Animated.View>

        {/* FULL PLAYER MASTERPIECE ("BLOOM") */}
        <Animated.View style={[styles.fullPlayer, fullPlayerStyle]}>
          {/* Layer 0: Atmospheric Aura (Blurred Artwork) */}
          <View style={StyleSheet.absoluteFill}>
            <Image 
              source={{ uri: currentTrack?.artwork || 'https://via.placeholder.com/600/0A192F/F1E5AC?text=Lpiks+Bloom' }} 
              style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
              blurRadius={50}
            />
            <LinearGradient
              colors={['rgba(5, 12, 22, 0.4)', 'rgba(5, 12, 22, 0.98)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={styles.fullPlayerContent}>
            {/* Header Control */}
            <View style={styles.masterpieceHeader}>
              <TouchableOpacity onPress={toggleExpansion} style={styles.headerIcon}>
                <ChevronDown size={32} color="#F1E5AC" />
              </TouchableOpacity>
              <Text style={styles.headerStatus}>S O V E R E I G N</Text>
              <TouchableOpacity 
                onPress={() => setShowLyrics(!showLyrics)} 
                style={styles.headerIcon}
              >
                <MessageSquareText size={24} color={showLyrics ? "#F1E5AC" : "rgba(241, 229, 172, 0.4)"} />
              </TouchableOpacity>
            </View>

            {/* Cinematic Artwork Stage */}
            <View style={styles.artworkStage}>
              {!showLyrics ? (
                <View style={styles.masterpieceArtworkCard}>
                  <Image 
                    source={{ uri: currentTrack?.artwork || 'https://via.placeholder.com/600/0A192F/F1E5AC?text=Lpiks+Bloom' }} 
                    style={styles.masterpieceArtwork} 
                  />
                  <LinearGradient
                    colors={['rgba(241, 229, 172, 0.1)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
                  />
                </View>
              ) : (
                <View style={styles.lyricsStage}>
                  <LyricsView 
                    lyrics={lyricsData} 
                    position={position} 
                    onSeek={(time) => console.log('Seeking to:', time)}
                  />
                </View>
              )}
            </View>

            {/* Metadata & Heart */}
            <View style={styles.masterpieceMeta}>
              <View style={styles.metaTextContainer}>
                <Text style={styles.masterpieceTitle} numberOfLines={1}>
                  {currentTrack?.title || 'Mouloudia'}
                </Text>
                <Text style={styles.masterpieceArtist}>
                  {currentTrack?.artist || 'Lpiks bloom'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={toggleFavorite} style={styles.heartOrb}>
                  <Heart 
                    size={32} 
                    color="#F1E5AC" 
                    fill={isFavorited ? "#F1E5AC" : "transparent"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowOptions(true)}
                  style={[styles.heartOrb, { marginLeft: 10 }]}
                >
                  <MoreVertical size={28} color="rgba(241, 229, 172, 0.6)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Industrial Progress Slider */}
            <View style={styles.sliderContainer}>
              <View 
                {...panResponder.panHandlers}
                style={styles.touchableTrack}
              >
                <View style={styles.sliderTrack}>
                  <Animated.View 
                    style={[
                      styles.sliderFill, 
                      progressStyle,
                      { overflow: 'hidden' }
                    ]} 
                  >
                    <LinearGradient
                      colors={['#F1E5AC', '#D4AF37', '#B8860B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Animated.View style={[styles.sliderGlow, beadStyle]} />
                  </Animated.View>
                </View>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>{formatTime(isScrubbing ? scrubPosition : position)}</Text>
                <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
              </View>
            </View>

            {/* Studio Controls */}
            <View style={styles.studioControls}>
              <TouchableOpacity style={styles.controlIconSecondary}>
                <SkipBack size={32} color="#F1E5AC" fill="#F1E5AC" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={togglePlayPause} 
                style={styles.mainPlayOrb}
              >
                <View style={styles.orbInner}>
                  {isPlaying ? (
                    <Pause size={42} color="#0A192F" fill="#0A192F" />
                  ) : (
                    <Play size={42} color="#0A192F" fill="#0A192F" />
                  )}
                </View>
                <View style={styles.orbGlow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlIconSecondary}>
                <SkipForward size={32} color="#F1E5AC" fill="#F1E5AC" />
              </TouchableOpacity>
            </View>

          </View>
        </Animated.View>

        {/* Sovereign Options Modal */}
        <Modal
          visible={showOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOptions(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              onPress={() => setShowOptions(false)} 
            />
            <View style={styles.optionsSheet}>
              <View style={styles.sheetHandle} />
              
              <View style={styles.sheetHeader}>
                <Image source={{ uri: currentTrack?.artwork }} style={styles.sheetArtwork} />
                <View style={styles.sheetMeta}>
                  <Text style={styles.sheetTitle} numberOfLines={1}>{currentTrack?.title}</Text>
                  <Text style={styles.sheetArtist} numberOfLines={1}>{currentTrack?.artist}</Text>
                </View>
              </View>

              <View style={styles.optionsList}>
                <TouchableOpacity style={styles.optionItem} onPress={toggleFavorite}>
                  <Heart size={22} color="#F1E5AC" fill={isFavorited ? "#F1E5AC" : "transparent"} />
                  <Text style={styles.optionText}>{isFavorited ? 'Remove from Vault' : 'Add to Vault'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <Plus size={22} color="#F1E5AC" />
                  <Text style={styles.optionText}>Add to Playlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <User size={22} color="#F1E5AC" />
                  <Text style={styles.optionText}>View Artist Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={handleShare}>
                  <Share2 size={22} color="#F1E5AC" />
                  <Text style={styles.optionText}>Share Masterpiece</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <Clock size={22} color="#F1E5AC" />
                  <Text style={styles.optionText}>Set Sleep Timer</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.sheetCloseButton} 
                onPress={() => setShowOptions(false)}
              >
                <Text style={styles.sheetCloseText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden', zIndex: 100 },
  luxuryBackground: { backgroundColor: '#0A192F', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.2)' },
  miniPlayer: { ...StyleSheet.absoluteFillObject, borderRadius: 16, overflow: 'hidden' },
  miniPlayerTouch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: '100%' },
  miniGlowBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(241, 229, 172, 0.15)' },
  miniArtworkContainer: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(241, 229, 172, 0.05)', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  miniArtwork: { width: '100%', height: '100%' },
  miniTitle: { color: '#F1E5AC', fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  miniArtist: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 13, fontWeight: '600' },
  miniActionCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1E5AC', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#F1E5AC', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  miniCloseOrb: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center', marginLeft: 12, borderWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.1)' },
  miniProgressContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(241, 229, 172, 0.05)' },
  miniProgressBar: { height: '100%', backgroundColor: '#F1E5AC' },
  
  // Masterpiece Overhaul Styles
  fullPlayer: { ...StyleSheet.absoluteFillObject },
  fullPlayerContent: { flex: 1, paddingTop: 40 },
  masterpieceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 60 },
  headerIcon: { padding: 10 },
  headerStatus: { color: '#F1E5AC', fontSize: 12, fontWeight: '900', letterSpacing: 4, opacity: 0.6 },
  
  artworkStage: { height: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  masterpieceArtworkCard: { width: SCREEN_WIDTH * 0.85, height: SCREEN_WIDTH * 0.85, borderRadius: 32, backgroundColor: '#1A2A4A', elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30 },
  masterpieceArtwork: { width: '100%', height: '100%', borderRadius: 32 },
  lyricsStage: { width: '100%', height: SCREEN_WIDTH * 0.85, paddingHorizontal: 30 },

  masterpieceMeta: { marginTop: 15, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaTextContainer: { flex: 1 },
  masterpieceTitle: { color: '#F1E5AC', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  masterpieceArtist: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 20, marginTop: 4, fontWeight: '600' },
  heartOrb: { padding: 10 },

  sliderContainer: { marginTop: 15, paddingHorizontal: 32 },
  touchableTrack: { height: 40, justifyContent: 'center', width: '100%' },
  sliderTrack: { height: 6, backgroundColor: 'rgba(241, 229, 172, 0.1)', borderRadius: 3 },
  sliderFill: { height: '100%', backgroundColor: '#F1E5AC', borderRadius: 3, position: 'relative' },
  sliderGlow: { position: 'absolute', right: -4, top: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#F1E5AC', shadowColor: '#F1E5AC', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  timeLabel: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 12, fontWeight: '700' },

  studioControls: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 20 },
  controlIconSecondary: { padding: 15 },
  mainPlayOrb: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1E5AC', justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#F1E5AC', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  orbInner: { width: '100%', height: '100%', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  
  bottomToolbox: { marginTop: 'auto', marginBottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  toolItem: { paddingHorizontal: 20, paddingVertical: 10 },
  toolText: { color: 'rgba(241, 229, 172, 0.3)', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  toolTextActive: { color: '#F1E5AC' },
  toolDivider: { width: 1, height: 12, backgroundColor: 'rgba(241, 229, 172, 0.1)' },
  
  // Options Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  optionsSheet: { backgroundColor: '#0A192F', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(241, 229, 172, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(241, 229, 172, 0.2)', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.1)' },
  sheetArtwork: { width: 60, height: 60, borderRadius: 12 },
  sheetMeta: { marginLeft: 16, flex: 1 },
  sheetTitle: { color: '#F1E5AC', fontSize: 20, fontWeight: '900' },
  sheetArtist: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 14, fontWeight: '600' },
  optionsList: { paddingHorizontal: 16, marginTop: 10 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12, borderRadius: 16 },
  optionText: { color: '#F1E5AC', fontSize: 16, fontWeight: '700', marginLeft: 16 },
  sheetCloseButton: { marginTop: 10, alignSelf: 'center', padding: 15 },
  sheetCloseText: { color: 'rgba(241, 229, 172, 0.3)', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});

export default BloomPlayer;
