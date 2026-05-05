import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Disc, ListMusic, User, Play, ChevronRight, ArrowDownCircle, Clock } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LibraryScreen = ({ navigation }) => {
  const { playTrack } = usePlayer();
  const [history, setHistory] = useState([]);
  const [offlineAlbums, setOfflineAlbums] = useState([]);
  const [offlinePlaylists, setOfflinePlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLibraryData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchLibraryData = async () => {
    try {
      const { getOfflineMap } = require('../utils/offlineService');
      const [histRes, offMap] = await Promise.all([
        fetch(`${API_URL}/api/diary/history`),
        getOfflineMap()
      ]);
      
      const histData = await histRes.json();
      setHistory(histData);
      
      // Intelligent Grouping Logic
      const tracks = Object.values(offMap);
      const albums = {};
      const playlists = {};

      tracks.forEach(track => {
        if (track.albumId) {
          if (!albums[track.albumId]) {
            albums[track.albumId] = {
              id: track.albumId,
              title: track.albumTitle,
              artist: track.artist,
              artwork: track.artwork || 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Album',
              type: 'album'
            };
          }
        } else if (track.playlistId) {
          if (!playlists[track.playlistId]) {
            playlists[track.playlistId] = {
              id: track.playlistId,
              title: track.playlistTitle,
              artwork: track.artwork || 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Playlist',
              type: 'playlist'
            };
          }
        }
      });

      setOfflineAlbums(Object.values(albums));
      setOfflinePlaylists(Object.values(playlists));
      
      console.log('[Library Audit] Offline Albums:', Object.keys(albums).length);
      console.log('[Library Audit] Offline Playlists:', Object.keys(playlists).length);
    } catch (error) {
      console.error('Failed to fetch library', error);
    } finally {
      setLoading(false);
    }
  };

  const LibraryCategory = ({ icon: Icon, title, count, onPress }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={styles.categoryLeft}>
        <View style={styles.iconContainer}>
          <Icon size={22} color="#F1E5AC" />
        </View>
        <View style={styles.categoryText}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>{count} items</Text>
        </View>
      </View>
      <ChevronRight size={20} color="rgba(241, 229, 172, 0.2)" />
    </TouchableOpacity>
  );

  const renderCollectionItem = ({ item }) => {
    const artworkUri = item.artwork || 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Sovereign';
    
    return (
      <TouchableOpacity 
        style={styles.recentItem}
        onPress={() => {
          if (item.type === 'album') {
            navigation.navigate('AlbumDetail', { albumId: item.id, albumTitle: item.title });
          } else if (item.type === 'playlist') {
            navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistTitle: item.title });
          } else {
            playTrack(item);
          }
        }}
      >
        <View style={styles.artworkContainer}>
          <Image 
            source={{ uri: artworkUri }} 
            style={styles.artwork} 
            resizeMode="cover"
          />
          <View style={styles.playBadge}>
            <ArrowDownCircle size={10} color="#0A192F" />
          </View>
        </View>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentArtist} numberOfLines={1}>
          {item.type === 'album' ? item.artist : (item.artist || 'Sovereign Selection')}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color="#F1E5AC" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
      </View>

      {/* Main Categories */}
      <View style={styles.categoriesSection}>
        <LibraryCategory 
          icon={Heart} 
          title="Favorite Songs" 
          count="Track" 
          onPress={() => navigation.navigate('FavoritesList', { type: 'track', title: 'Favorite Songs' })} 
        />
        <LibraryCategory 
          icon={Disc} 
          title="Albums" 
          count="Saved" 
          onPress={() => navigation.navigate('FavoritesList', { type: 'album', title: 'Favorite Albums' })} 
        />
        <LibraryCategory 
          icon={ListMusic} 
          title="Playlists" 
          count="Created" 
          onPress={() => navigation.navigate('FavoritesList', { type: 'playlist', title: 'Your Playlists' })} 
        />
        <LibraryCategory 
          icon={User} 
          title="Artists" 
          count="Followed" 
          onPress={() => navigation.navigate('FavoritesList', { type: 'artist', title: 'Followed Artists' })} 
        />
      </View>

      {/* Offline Albums Section */}
      {offlineAlbums.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Disc size={20} color="#F1E5AC" />
            <Text style={styles.sectionTitle}>Offline Albums</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={offlineAlbums}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => `off-alb-${item.id}`}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      {/* Offline Playlists Section */}
      {offlinePlaylists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ListMusic size={20} color="#F1E5AC" />
            <Text style={styles.sectionTitle}>Offline Playlists</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={offlinePlaylists}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => `off-pl-${item.id}`}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      {/* Recently Played Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color="#F1E5AC" />
          <Text style={styles.sectionTitle}>Sovereign History</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={history}
          renderItem={(props) => renderCollectionItem({ ...props, item: { ...props.item, type: 'track' } })}
          keyExtractor={(item, index) => `lib-hist-${index}`}
          contentContainerStyle={styles.recentList}
        />
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 30 },
  headerTitle: { color: '#F1E5AC', fontSize: 32, fontWeight: 'bold', fontFamily: 'serif' },
  
  categoriesSection: { paddingHorizontal: 24, marginBottom: 40 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(241, 229, 172, 0.05)' },
  categoryLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(241, 229, 172, 0.05)', alignItems: 'center', justifyContent: 'center' },
  categoryText: { marginLeft: 16 },
  categoryTitle: { color: '#F1E5AC', fontSize: 17, fontWeight: '600' },
  categoryCount: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 13, marginTop: 2 },

  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20, gap: 10 },
  sectionTitle: { color: '#F1E5AC', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  recentList: { paddingHorizontal: 16 },
  recentItem: { width: 140, marginRight: 16 },
  artworkContainer: { width: 140, height: 140, borderRadius: 16, overflow: 'hidden', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative' },
  artwork: { width: '100%', height: '100%' },
  playBadge: { position: 'absolute', right: 8, bottom: 8, width: 22, height: 22, backgroundColor: '#F1E5AC', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { color: '#F1E5AC', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  recentArtist: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 12 }
});

export default LibraryScreen;
