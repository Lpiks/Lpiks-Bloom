import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

// Dynamic API detection: use 10.0.2.2 for Android Emulator, 
// but for physical devices, we should use the actual IP.
// For now, I will use a reliable placeholder or the user's instructions.
const API_URL = process.env.EXPO_PUBLIC_API_URL; 

export const usePlayer = () => {
  const player = useAudioPlayer('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const status = useAudioPlayerStatus(player);
  const soundRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState({
    title: 'Mouloudia',
    artist: 'Lpiks bloom',
    album: 'Sovereign foundation',
    artwork: 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Lpiks+Bloom'
  });

  const logTrack = async (track) => {
    try {
      await fetch(`${API_URL}/api/diary/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          artwork: track.artwork,
          vibe: 'Ghibli'
        })
      });
    } catch (error) {
      console.warn('Diary logging failed', error);
    }
  };

  const togglePlayPause = async () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
      logTrack(currentTrack);
    }
  };

  const seekTo = (seconds) => {
    player.seekTo(seconds);
  };

  return { 
    currentTrack, 
    isPlaying: status.playing, 
    position: status.currentTime, 
    duration: status.duration, 
    togglePlayPause, 
    seekTo 
  };
};
