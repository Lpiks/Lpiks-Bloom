import { useState, useEffect } from 'react';
import TrackPlayer, { useTrackPlayerEvents, Event, State } from 'react-native-track-player';

const sentenceCase = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const usePlayerState = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerState, setPlayerState] = useState(State.None);

  useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackState], async (event) => {
    if (!TrackPlayer || typeof TrackPlayer.getTrack !== 'function') return;
    
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      if (track) {
        // Apply "Mouloudia" rule
        setCurrentTrack({
          ...track,
          artist: sentenceCase(track.artist),
          title: sentenceCase(track.title),
          album: sentenceCase(track.album),
        });
      }
    }
    if (event.type === Event.PlaybackState) {
      setPlayerState(event.state);
    }
  });

  return { currentTrack, playerState };
};
