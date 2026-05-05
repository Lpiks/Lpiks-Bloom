import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, User, Music, Disc, Heart } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ArtistDetailScreen = ({ route, navigation }) => {
  const { artistId, artistName } = route.params;
  const { playTrack } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchArtistDetails();
    checkFavoriteStatus();
  }, [artistId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites/check/artist/${artistId}`);
      const data = await response.json();
      setIsFavorited(data.isFavorited);
    } catch (e) {}
  };

  const toggleFavorite = async () => {
    if (!artist) return;
    try {
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'artist',
          itemId: artist.id,
          metadata: {
            name: artist.name,
            picture_medium: artist.picture_medium
          }
        })
      });
      const data = await response.json();
      setIsFavorited(data.status === 'added');
    } catch (e) {}
  };

  const fetchArtistDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist/${artistId}`);
      const data = await response.json();
      setArtist(data);
    } catch (error) {
      console.error('Failed to fetch artist details', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => playTrack(item)}
    >
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
      </View>
      <Play size={14} color="#F1E5AC" opacity={0.3} />
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.albumItem}
      onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id, albumTitle: item.title })}
    >
      <Image source={{ uri: item.artwork }} style={styles.albumArtwork} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumYear}>{item.release_date?.split('-')[0]}</Text>
    </TouchableOpacity>
  );

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
      
      {/* Header Profile */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#F1E5AC" />
        </TouchableOpacity>
        
        <View style={styles.profileContainer}>
          <Image source={{ uri: artist?.artwork }} style={styles.profileImg} />
          <LinearGradient
            colors={['transparent', 'rgba(10, 25, 47, 0.95)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.artistName}>{artist?.name}</Text>
          <Text style={styles.fanCount}>{Number(artist?.nb_fans).toLocaleString()} Fans</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.followButton, isFavorited && { backgroundColor: '#F1E5AC' }]} onPress={toggleFavorite}>
              <Heart 
                size={20} 
                color={isFavorited ? "#0A192F" : "#F1E5AC"} 
                fill={isFavorited ? "#0A192F" : "transparent"} 
              />
              <Text style={[styles.followButtonText, isFavorited && { color: '#0A192F' }]}>
                {isFavorited ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={() => playTrack(artist.topTracks[0])}>
              <Play size={18} color="#0A192F" fill="#0A192F" />
              <Text style={styles.playButtonText}>Start Radio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Top Tracks Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Music size={18} color="#F1E5AC" />
          <Text style={styles.sectionTitle}>Top Hits</Text>
        </View>
        {artist?.topTracks.map((track, index) => (
          <React.Fragment key={track.id}>
            {renderTrackItem({ item: track, index })}
          </React.Fragment>
        ))}
      </View>

      {/* Discography Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Disc size={18} color="#F1E5AC" />
          <Text style={styles.sectionTitle}>Discography</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={artist?.albums}
          renderItem={renderAlbumItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.albumList}
        />
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 32 },
  backButton: { position: 'absolute', top: 60, left: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  profileContainer: { width: '100%', height: 350 },
  profileImg: { width: '100%', height: '100%' },
  nameContainer: { paddingHorizontal: 24, marginTop: -80 },
  artistName: { color: '#F1E5AC', fontSize: 44, fontWeight: 'bold', fontFamily: 'serif' },
  fanCount: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 14, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  playButton: { backgroundColor: '#F1E5AC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  playButtonText: { color: '#0A192F', fontWeight: 'bold', marginLeft: 8 },
  followButton: { borderWidth: 1, borderColor: 'rgba(241, 229, 172, 0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, justifyContent: 'center' },
  followButtonText: { color: '#F1E5AC', fontWeight: 'bold' },
  
  section: { paddingHorizontal: 24, marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionTitle: { color: '#F1E5AC', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(241, 229, 172, 0.05)' },
  trackNumber: { color: 'rgba(241, 229, 172, 0.3)', fontSize: 14, width: 30 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#F1E5AC', fontSize: 16, fontWeight: '600' },
  
  albumList: { paddingRight: 24 },
  albumItem: { width: 140, marginRight: 16 },
  albumArtwork: { width: 140, height: 140, borderRadius: 12, marginBottom: 8 },
  albumTitle: { color: '#F1E5AC', fontSize: 14, fontWeight: 'bold' },
  albumYear: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 12 }
});

export default ArtistDetailScreen;
