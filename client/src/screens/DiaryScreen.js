import React, { useState, useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Calendar, Heart, Shield, Sparkles, Coffee, Moon, Zap } from 'lucide-react-native';

const MoodChips = React.memo(({ selectedMood, onSelect }) => {
  const moods = [
    { id: 'all', label: 'All Beats', icon: Sparkles },
    { id: 'calm', label: 'Calm', icon: Coffee },
    { id: 'chill', label: 'Chill', icon: Moon },
    { id: 'energy', label: 'High Energy', icon: Zap },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.moodScroll}
      contentContainerStyle={styles.moodContent}
    >
      {moods.map((mood) => {
        const Icon = mood.icon;
        const isActive = selectedMood === mood.id;
        return (
          <TouchableOpacity 
            key={mood.id} 
            onPress={() => onSelect(mood.id)}
            style={[styles.moodChip, isActive && styles.moodChipActive]}
          >
            <Icon size={14} color={isActive ? "#0A192F" : "#F1E5AC"} style={{ marginRight: 6 }} />
            <Text style={[styles.moodLabel, isActive && styles.moodLabelActive]}>{mood.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const DiaryScreen = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('all');

  useEffect(() => {
    fetchDiary();
  }, []);

  const fetchDiary = async () => {
    try {
      const response = await fetch('https://lpiks-bloom.onrender.com/api/diary/history');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Diary fetch failed', error);
      setSections([
        {
          title: 'Tuesday, May 5, 2026',
          data: [
            { id: '1', track: { title: 'Mouloudia', artist: 'Lpiks bloom', artwork: 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Mouloudia' }, vibe: 'Sovereign', vaulted: true },
            { id: '2', track: { title: 'Sovereign Foundation', artist: 'Lpiks bloom', artwork: 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Sovereign' }, vibe: 'Atmospheric', vaulted: false },
            { id: '3', track: { title: 'Desert Bloom', artist: 'Lpiks bloom', artwork: 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Desert' }, vibe: 'High Energy', vaulted: true }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.diaryItem}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        <View style={[styles.timelineDot, item.vaulted && styles.timelineDotVaulted]} />
      </View>
      
      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <View style={styles.artworkContainer}>
          <Image source={{ uri: item.track.artwork }} style={styles.artwork} />
          {item.vaulted && (
            <View style={styles.vaultBadge}>
              <Shield size={10} color="#0A192F" fill="#0A192F" />
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.track.title}</Text>
            {item.vaulted && <Sparkles size={12} color="#F1E5AC" style={{ marginLeft: 6 }} />}
          </View>
          <Text style={styles.artist} numberOfLines={1}>{item.track.artist}</Text>
          
          <View style={styles.metaFooter}>
            <View style={styles.vibeBadge}>
              <Text style={styles.vibeText}>{item.vibe || 'Discovery'}</Text>
            </View>
            <Text style={styles.timeTag}>19:48</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#0A192F', '#050C16']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <View style={styles.titleZone}>
          <Text style={styles.headerTitle}>Chronicles</Text>
          <View style={styles.diaryOrb} />
        </View>
        <Text style={styles.headerSubtitle}>Your musical soul, archived in sovereignty.</Text>
      </View>

      <MoodChips selectedMood={selectedMood} onSelect={setSelectedMood} />

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderGlow} />
            <Calendar size={14} color="#F1E5AC" style={{ marginRight: 10, opacity: 0.6 }} />
            <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
  titleZone: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#F1E5AC', fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  diaryOrb: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F1E5AC', marginLeft: 12, shadowColor: '#F1E5AC', shadowRadius: 10, shadowOpacity: 0.8 },
  headerSubtitle: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 13, marginTop: 4, fontWeight: '600', letterSpacing: 1 },
  
  moodScroll: { height: 70, marginTop: 15 },
  moodContent: { paddingHorizontal: 24, alignItems: 'center', height: '100%' },
  moodChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, backgroundColor: 'rgba(241, 229, 172, 0.05)', marginRight: 12, borderWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.1)' },
  moodChipActive: { backgroundColor: '#F1E5AC' },
  moodLabel: { color: '#F1E5AC', fontSize: 12, fontWeight: '800' },
  moodLabelActive: { color: '#0A192F' },

  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 20, paddingLeft: 10 },
  sectionHeaderGlow: { position: 'absolute', left: -10, width: 4, height: 20, backgroundColor: '#F1E5AC', borderRadius: 2, shadowColor: '#F1E5AC', shadowRadius: 10, shadowOpacity: 0.5 },
  sectionTitle: { color: '#F1E5AC', fontSize: 13, fontWeight: '900', letterSpacing: 2, opacity: 0.8 },

  diaryItem: { flexDirection: 'row', marginBottom: 24 },
  timelineContainer: { width: 30, alignItems: 'center', marginRight: 10 },
  timelineLine: { position: 'absolute', top: 30, bottom: -30, width: 1, backgroundColor: 'rgba(241, 229, 172, 0.1)' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(241, 229, 172, 0.2)', marginTop: 15 },
  timelineDotVaulted: { backgroundColor: '#F1E5AC', shadowColor: '#F1E5AC', shadowRadius: 5, shadowOpacity: 0.8 },

  card: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  artworkContainer: { width: 64, height: 64, borderRadius: 16, overflow: 'hidden' },
  artwork: { width: '100%', height: '100%' },
  vaultBadge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#F1E5AC', justifyContent: 'center', alignItems: 'center' },
  
  info: { marginLeft: 16, flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#F1E5AC', fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
  artist: { color: 'rgba(241, 229, 172, 0.4)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  
  metaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  vibeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(241, 229, 172, 0.05)', borderWidth: 0.5, borderColor: 'rgba(241, 229, 172, 0.1)' },
  vibeText: { color: '#F1E5AC', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  timeTag: { color: 'rgba(241, 229, 172, 0.3)', fontSize: 11, fontWeight: '800' }
});

export default DiaryScreen;
