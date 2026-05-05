import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, ListMusic, Download, CheckCircle, ArrowDownCircle, Heart } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { downloadTrack, getLocalUri, deleteTrack } from '../utils/offlineService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PlaylistDetailScreen = ({ route, navigation }) => {
  const { playlistId, playlistTitle } = route.params;
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    fetchPlaylistDetails();
    checkOfflineStatus();
    checkFavoriteStatus();
  }, [playlistId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites/check/playlist/${playlistId}`);
      const data = await response.json();
      setIsFavorited(data.isFavorited);
    } catch (e) {}
  };

  const toggleFavorite = async () => {
    if (!playlist) return;
    try {
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'playlist',
          itemId: playlist.id,
          metadata: {
            title: playlist.title,
            artwork: playlist.artwork
          }
        })
      });
      const data = await response.json();
      setIsFavorited(data.status === 'added');
    } catch (e) {}
  };

  const checkOfflineStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/playlist/${playlistId}`);
      const data = await response.json();
      setPlaylist(data);

      // Perform immediate vault scan
      const { getOfflineMap } = require('../utils/offlineService');
      const offlineMap = await getOfflineMap();
      const progress = {};
      let allDownloaded = true;

      data.tracks.forEach(track => {
        if (offlineMap[track.id]) {
          progress[track.id] = 1;
        } else {
          allDownloaded = false;
        }
      });
      setDownloadProgress(progress);
      setIsDownloaded(allDownloaded && data.tracks.length > 0);
    } catch (error) {
      console.error('Failed to fetch playlist details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/playlist/${playlistId}`);
      const data = await response.json();
      setPlaylist(data);

      // Perform immediate vault scan
      const { getOfflineMap } = require('../utils/offlineService');
      const offlineMap = await getOfflineMap();
      const progress = {};
      let allDownloaded = true;

      data.tracks.forEach(track => {
        if (offlineMap[track.id]) {
          progress[track.id] = 1;
        } else {
          allDownloaded = false;
        }
      });
      setDownloadProgress(progress);
      setIsDownloaded(allDownloaded && data.tracks.length > 0);
    } catch (error) {
      console.error('Failed to fetch playlist details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!playlist) return;
    
    if (isDownloaded) {
      // Sovereign Release: Remove from vault
      for (const track of playlist.tracks) {
        await deleteTrack(track.id);
      }
      setDownloadProgress({});
      setIsDownloaded(false);
    } else {
      // Vault Sync: Secure to local storage
      setIsDownloaded(true);
      for (const track of playlist.tracks) {
        setDownloadProgress(prev => ({ ...prev, [track.id]: 0.1 }));
        await downloadTrack({
          ...track,
          playlistId: playlist.id,
          playlistTitle: playlist.title
        }, (progress) => {
          setDownloadProgress(prev => ({ ...prev, [track.id]: progress }));
        });
        setDownloadProgress(prev => ({ ...prev, [track.id]: 1 }));
      }
    }
  };

  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => playTrack(item)}
    >
      <View style={styles.artworkMini}>
        <Image source={{ uri: item.artwork }} style={styles.miniImg} />
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      {downloadProgress[item.id] === 1 ? (
        <CheckCircle size={16} color="#F1E5AC" />
      ) : downloadProgress[item.id] > 0 ? (
        <ActivityIndicator size="small" color="#F1E5AC" />
      ) : (
        <Play size={16} color="#F1E5AC" opacity={0.3} />
      )}
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
    <View style={styles.container}>
      <LinearGradient colors={['#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      <FlatList
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={28} color="#F1E5AC" />
            </TouchableOpacity>
            
            <View style={styles.artworkContainer}>
              <Image source={{ uri: playlist?.artwork }} style={styles.artwork} />
              <LinearGradient
                colors={['transparent', 'rgba(10, 25, 47, 0.9)']}
                style={StyleSheet.absoluteFill}
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.playlistTitle}>{playlist?.title}</Text>
              <Text style={styles.playlistCreator}>Curated by {playlist?.creator}</Text>
              <Text style={styles.playlistMeta}>{playlist?.nb_tracks} tracks • Sovereign Selection</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.playButton} onPress={() => playTrack(playlist.tracks[0])}>
                  <Play size={20} color="#0A192F" fill="#0A192F" />
                  <Text style={styles.playButtonText}>Play Selection</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.downloadBtn, isDownloaded && styles.downloadBtnActive]} 
                  onPress={handleDownloadAll}
                >
                  <ArrowDownCircle size={24} color={isDownloaded ? '#0A192F' : '#F1E5AC'} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.downloadBtn} 
                  onPress={toggleFavorite}
                >
                  <Heart 
                    size={24} 
                    color="#F1E5AC" 
                    fill={isFavorited ? "#F1E5AC" : "transparent"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        data={playlist?.tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30 },
  backButton: { position: 'absolute', top: 60, left: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  artworkContainer: { width: '100%', height: 400, position: 'relative' },
  artwork: { width: '100%', height: '100%' },
  infoSection: { paddingHorizontal: 24, marginTop: -60 },
  playlistTitle: { color: '#F1E5AC', fontSize: 32, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 4 },
  playlistCreator: { color: 'rgba(241, 229, 172, 0.7)', fontSize: 18, marginBottom: 8 },
  playlistMeta: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 14, marginBottom: 20 },
  playButton: { backgroundColor: '#F1E5AC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, shadowColor: '#F1E5AC', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  playButtonText: { color: '#0A192F', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  downloadBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(241, 229, 172, 0.2)', alignItems: 'center', justifyContent: 'center' },
  downloadBtnActive: { backgroundColor: '#F1E5AC', borderColor: '#F1E5AC' },
  listContent: { paddingBottom: 120 },
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  artworkMini: { width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  miniImg: { width: '100%', height: '100%' },
  trackInfo: { flex: 1, marginLeft: 16 },
  trackTitle: { color: '#F1E5AC', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  trackArtist: { color: 'rgba(241, 229, 172, 0.5)', fontSize: 12 }
});

export default PlaylistDetailScreen;
