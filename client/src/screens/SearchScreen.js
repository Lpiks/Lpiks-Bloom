import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Search as SearchIcon, Play, Music, Disc, ListMusic, Clock, User, X, History, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../context/PlayerContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SEARCH_HISTORY_KEY = '@bloom_search_history';

const SearchScreen = ({ navigation }) => {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tracks: [], albums: [], playlists: [] });
  const [listenHistory, setListenHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      fetchListenHistory(),
      loadSearchHistory()
    ]);
  };

  const fetchListenHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/diary/history`);
      const data = await response.json();
      setListenHistory(data.slice(0, 5)); 
    } catch (e) {}
  };

  const loadSearchHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch (e) {}
  };

  const saveSearchQuery = async (text) => {
    if (!text || text.trim().length < 2) return;
    try {
      const newHistory = [text, ...searchHistory.filter(q => q !== text)].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {}
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) {
      setResults({ tracks: [], albums: [], playlists: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/search?query=${encodeURIComponent(text)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    if (query.trim().length >= 2) {
      saveSearchQuery(query.trim());
    }
  };

  const handleItemPress = (item) => {
    if (item.type === 'track') {
      handleTrackPress(item);
    } else if (item.type === 'album') {
      navigation.navigate('AlbumDetail', { albumId: item.id, albumTitle: item.title });
    } else if (item.type === 'playlist') {
      navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistTitle: item.title });
    }
  };

  const handleTrackPress = async (track) => {
    // Ghost Save: Metadata preservation
    try {
      fetch(`${API_URL}/api/music/ghost-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          artwork: track.artwork,
          album: track.album || 'Bloom Discovery'
        })
      });
    } catch (e) {}

    playTrack(track);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderRow}>
            {item.icon}
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
          {item.onClear && (
            <TouchableOpacity onPress={item.onClear}>
              <Text style={styles.clearText}>CLEAR</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (item.type === 'query') {
      return (
        <TouchableOpacity 
          style={styles.queryChip} 
          onPress={() => handleSearch(item.text)}
        >
          <History size={14} color="#F1E5AC" style={{ marginRight: 8, opacity: 0.5 }} />
          <Text style={styles.queryText}>{item.text}</Text>
        </TouchableOpacity>
      );
    }

    const subtitle = item.type === 'track' ? item.artist : 
                     item.type === 'album' ? `${item.artist} • Album` : 
                     item.type === 'artist' ? 'Artist' :
                     `Playlist • ${item.nb_tracks} tracks`;

    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.artwork }} 
          style={[styles.artwork, item.type === 'artist' && styles.artistArtwork]} 
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title || item.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        {item.type === 'track' && (
          <View style={styles.playIcon}>
            <Play size={14} color="#0A192F" fill="#0A192F" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const flatData = query.length < 2 
    ? [
        ...(searchHistory.length > 0 ? [{ type: 'header', title: 'Recent Echoes', icon: <History size={18} color="#F1E5AC" />, onClear: clearSearchHistory }, ...searchHistory.map(q => ({ type: 'query', text: q }))] : []),
        ...(listenHistory.length > 0 ? [{ type: 'header', title: 'Recent Masterpieces', icon: <Clock size={18} color="#F1E5AC" /> }, ...listenHistory.map(t => ({ ...t, type: 'track' }))] : []),
        ...(searchHistory.length === 0 && listenHistory.length === 0 ? [{ type: 'header', title: 'Discover', icon: <Sparkles size={18} color="#F1E5AC" /> }] : [])
      ]
    : [
        ...((results?.tracks?.length || 0) > 0 ? [{ type: 'header', title: 'Top Hits', icon: <Music size={18} color="#F1E5AC" /> }, ...results.tracks] : []),
        ...((results?.artists?.length || 0) > 0 ? [{ type: 'header', title: 'Artists', icon: <User size={18} color="#F1E5AC" /> }, ...results.artists] : []),
        ...((results?.albums?.length || 0) > 0 ? [{ type: 'header', title: 'Albums', icon: <Disc size={18} color="#F1E5AC" /> }, ...results.albums] : []),
        ...((results?.playlists?.length || 0) > 0 ? [{ type: 'header', title: 'Playlists', icon: <ListMusic size={18} color="#F1E5AC" /> }, ...results.playlists] : []),
      ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discovery</Text>
        <View style={styles.searchBar}>
          {loading ? <ActivityIndicator color="#F1E5AC" size="small" /> : <SearchIcon size={20} color="rgba(241, 229, 172, 0.4)" />}
          <TextInput
            style={styles.input}
            placeholder="Search the global library..."
            placeholderTextColor="rgba(241, 229, 172, 0.4)"
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleQuerySubmit}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X size={18} color="rgba(241, 229, 172, 0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={flatData}
        keyExtractor={(item, index) => `${item.type}-${item.id || item.text || index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          !loading && query.length > 1 ? (
            <View style={styles.empty}>
              <Music size={40} color="rgba(241, 229, 172, 0.1)" />
              <Text style={styles.emptyText}>No matches found in the matrix.</Text>
            </View>
          ) : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { color: '#F1E5AC', fontSize: 32, fontWeight: 'bold', fontFamily: 'serif' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(241, 229, 172, 0.1)',
  },
  input: { flex: 1, color: '#F1E5AC', marginLeft: 12, fontSize: 16 },
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: '#F1E5AC', fontSize: 18, fontWeight: 'bold', marginLeft: 10, textTransform: 'uppercase', letterSpacing: 2 },
  clearText: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 12, fontWeight: 'bold' },
  
  queryChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12, 
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(241, 229, 172, 0.05)'
  },
  queryText: { color: '#F1E5AC', fontSize: 15, fontWeight: '500' },
  
  itemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 12 },
  artwork: { width: 55, height: 55, borderRadius: 10 },
  artistArtwork: { borderRadius: 27.5 },
  info: { flex: 1, marginLeft: 16 },
  title: { color: '#F1E5AC', fontSize: 16, fontWeight: '600' },
  subtitle: { color: 'rgba(241, 229, 172, 0.6)', fontSize: 13, marginTop: 4 },
  playIcon: { backgroundColor: '#F1E5AC', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(241, 229, 172, 0.3)', marginTop: 20, fontSize: 16 }
});

export default SearchScreen;
