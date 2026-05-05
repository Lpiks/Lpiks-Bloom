import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export const PlayerContext = createContext();
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const PlayerProvider = ({ children }) => {
  const [trackUrl, setTrackUrl] = useState('');
  const [currentTrack, setCurrentTrack] = useState({
    id: 'empty',
    title: 'Discovery',
    artist: 'Lpiks bloom',
    artwork: 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Discovery',
    url: '',
    duration: 0
  });

  const player = useAudioPlayer(trackUrl);
  const status = useAudioPlayerStatus(player);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (currentTrack?.id) {
      checkFavoriteStatus();
    }
  }, [currentTrack]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites/check/track/${currentTrack.id}`);
      const data = await response.json();
      setIsFavorited(data.isFavorited);
    } catch (error) {
      setIsFavorited(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentTrack?.id) {
      console.warn('[Favorites] Cannot toggle: No Track ID found');
      return;
    }
    
    try {
      console.log('[Favorites] Toggling:', currentTrack.title);
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'track',
          itemId: currentTrack.id,
          metadata: {
            title: currentTrack.title,
            artist: currentTrack.artist,
            artwork: currentTrack.artwork
          }
        })
      });
      const data = await response.json();
      console.log('[Favorites] Server Response:', data.status);
      setIsFavorited(data.status === 'added');
    } catch (error) {
      console.error('[Favorites Error] Failed to toggle:', error);
    }
  };

  useEffect(() => {
    if (player && !status.playing && trackUrl !== 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') {
      player.play();
    }
  }, [player, trackUrl]);

  const playTrack = async (track) => {
    const { getLocalUri } = require('../utils/offlineService');
    const localUri = await getLocalUri(track.id);
    
    const streamUrl = `${API_URL}/api/music/proxy-stream?artist=${encodeURIComponent(track.artist)}&title=${encodeURIComponent(track.title)}`;
    const finalUrl = localUri || streamUrl;
    
    // We explicitly preserve the duration from the metadata
    setCurrentTrack({
      ...track,
      url: finalUrl,
      duration: track.duration || 180
    });
    
    setTrackUrl(finalUrl);

    // Synchronize Metadata for Notification Controls
    if (player) {
      player.metadata = {
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        album: track.album || 'LPIKS BLOOM'
      };
    }

    try {
      fetch(`${API_URL}/api/diary/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          artwork: track.artwork,
          vibe: 'Discovery'
        })
      });
    } catch (e) {}
  };

  const stopTrack = async () => {
    try {
      if (player) {
        player.pause();
      }
      setTrackUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      setCurrentTrack(null);
    } catch (error) {
      console.error('Failed to stop track', error);
    }
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekTo = (seconds) => {
    if (player) {
      // expo-audio uses seconds (float) for seekTo
      player.seekTo(seconds);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      isPlaying: status.playing, 
      isFavorited,
      position: status.currentTime, 
      // We prioritize the metadata duration over the stream's reported duration
      duration: currentTrack?.duration || status.duration,
      playTrack,
      stopTrack,
      togglePlayPause,
      toggleFavorite,
      seekTo
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
