import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Play, Plus, Clock } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = ({ navigation }) => {
  const { playTrack } = usePlayer();
  const [trending, setTrending] = useState({ tracks: [], albums: [], playlists: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [trendRes, histRes] = await Promise.all([
        fetch(`${API_URL}/api/trending`),
        fetch(`${API_URL}/api/diary/history`)
      ]);
      const trendData = await trendRes.json();
      const histData = await histRes.json();
      
      setTrending(trendData);
      setHistory(histData.slice(0, 10));
    } catch (error) {
      console.error('Pro Home Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item, type) => {
    if (type === 'track') {
      playTrack(item);
    } else if (type === 'album') {
      navigation.navigate('AlbumDetail', { albumId: item.id, albumTitle: item.title });
    } else if (type === 'playlist') {
      navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistTitle: item.title });
    }
  };

  const renderCarouselItem = ({ item, type }) => (
    <TouchableOpacity 
      style={styles.carouselItem}
      onPress={() => handleItemPress(item, type)}
    >
      <View style={styles.carouselArtworkContainer}>
        <Image source={{ uri: item.artwork }} style={styles.carouselArtwork} />
        {type === 'track' && (
          <View style={styles.playBadge}>
            <Play size={12} color="#0A192F" fill="#0A192F" />
          </View>
        )}
      </View>
      <Text style={styles.carouselTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.carouselSubtitle} numberOfLines={1}>
        {type === 'track' ? item.artist : (type === 'album' ? item.artist : 'Playlist')}
      </Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, onPress }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSeeAll = (type) => {
    if (type === 'history') {
      navigation.navigate('Diary');
    } else {
      navigation.navigate('SearchStack');
    }
  };

  const handleStartFlow = () => {
    if (trending.tracks && trending.tracks.length > 0) {
      playTrack(trending.tracks[0]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color="#F1E5AC" size="large" />
        <Text style={styles.loadingText}>Calibrating Discovery Hub...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      {/* Cinematic Hero */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={['#FF0055', '#4A90E2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>MADE FOR YOU</Text>
            <Text style={styles.heroTitle}>Sovereign Flow</Text>
            <Text style={styles.heroDescription}>Your personal infinite mix powered by Ghibli aesthetics.</Text>
            <TouchableOpacity style={styles.heroButton} onPress={handleStartFlow}>
              <Play size={20} color="#0A192F" fill="#0A192F" />
              <Text style={styles.heroButtonText}>Start Flow</Text>
            </TouchableOpacity>
          </View>
          <Sparkles style={styles.heroSparkle} size={80} color="rgba(255,255,255,0.1)" />
        </LinearGradient>
      </View>

      {/* Top Charts Carousel */}
      <View style={styles.section}>
        <SectionHeader title="Global Charts" onPress={() => handleSeeAll('charts')} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={trending.tracks}
          renderItem={(props) => renderCarouselItem({ ...props, type: 'track' })}
          keyExtractor={(item) => `chart-${item.id}`}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Recent History Horizontal */}
      {history.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Recently Played" onPress={() => handleSeeAll('history')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={history}
            renderItem={(props) => renderCarouselItem({ ...props, type: 'track' })}
            keyExtractor={(item, index) => `hist-${index}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Editorial Playlists */}
      <View style={styles.section}>
        <SectionHeader title="Editorial Picks" onPress={() => handleSeeAll('editorial')} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={trending.playlists}
          renderItem={(props) => renderCarouselItem({ ...props, type: 'playlist' })}
          keyExtractor={(item) => `playlist-${item.id}`}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#F1E5AC', marginTop: 16, fontFamily: 'serif', opacity: 0.6 },
  
  heroContainer: { paddingHorizontal: 24, paddingTop: 60, marginBottom: 32 },
  heroCard: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', padding: 24, position: 'relative' },
  heroContent: { flex: 1, justifyContent: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  heroDescription: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20, width: '70%' },
  heroButton: { backgroundColor: '#F1E5AC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  heroButtonText: { color: '#0A192F', fontWeight: 'bold', marginLeft: 8 },
  heroSparkle: { position: 'absolute', right: -20, bottom: -20 },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: '#F1E5AC', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  seeAllText: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 14 },

  horizontalList: { paddingHorizontal: 16 },
  carouselItem: { width: 140, marginRight: 16 },
  carouselArtworkContainer: { width: 140, height: 140, borderRadius: 16, overflow: 'hidden', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  carouselArtwork: { width: '100%', height: '100%' },
  carouselTitle: { color: '#F1E5AC', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  carouselSubtitle: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 12 },
  
  playBadge: { position: 'absolute', right: 8, bottom: 8, width: 24, height: 24, backgroundColor: '#F1E5AC', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }
});

export default HomeScreen;
