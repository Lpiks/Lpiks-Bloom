import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, ChevronLeft, Play, ArrowDownCircle } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const FavoritesListScreen = ({ route, navigation }) => {
  const { type, title } = route.params;
  const { playTrack } = usePlayer();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [type]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites/${type}`);
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const meta = item.metadata;
    return (
      <TouchableOpacity 
        style={styles.favItem}
        onPress={() => {
          if (type === 'track') {
            playTrack({ id: item.itemId, ...meta });
          } else if (type === 'album') {
            navigation.navigate('AlbumDetail', { albumId: item.itemId, albumTitle: meta.title });
          } else if (type === 'artist') {
            navigation.navigate('ArtistDetail', { artistId: item.itemId, artistName: meta.name });
          } else if (type === 'playlist') {
            navigation.navigate('PlaylistDetail', { playlistId: item.itemId, playlistTitle: meta.title });
          }
        }}
      >
        <Image 
          source={{ uri: meta.artwork || meta.picture_medium || 'https://via.placeholder.com/150/0A192F/F1E5AC?text=' + (meta.title || meta.name) }} 
          style={[styles.artwork, type === 'artist' && { borderRadius: 30 }]} 
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{meta.title || meta.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {type === 'track' ? meta.artist : (type === 'album' ? meta.artist : 'Sovereign Curation')}
          </Text>
        </View>
        {type === 'track' ? (
          <Play size={20} color="#F1E5AC" fill="#F1E5AC" />
        ) : (
          <ArrowDownCircle size={20} color="rgba(241, 229, 172, 0.3)" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#F1E5AC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#F1E5AC" size="large" style={{ marginTop: 50 }} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="rgba(241, 229, 172, 0.1)" />
          <Text style={styles.emptyText}>Your curated list is empty</Text>
          <Text style={styles.emptySubtext}>Explore the matrix and heart your favorites</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#F1E5AC', fontSize: 24, fontWeight: 'bold', fontFamily: 'serif' },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  favItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(241, 229, 172, 0.03)', padding: 10, borderRadius: 12 },
  artwork: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  title: { color: '#F1E5AC', fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 13, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#F1E5AC', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySubtext: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 14, textAlign: 'center', marginTop: 10 }
});

export default FavoritesListScreen;
