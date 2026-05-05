import axios from 'axios';

const BASE_URL = 'https://lrclib.net/api';

/**
 * Lyric Sovereign Service
 * Fetches real-time synced lyrics for the current track.
 */
export const fetchLyrics = async (artist, title, duration) => {
  try {
    console.log(`[Lyric Service] Fetching for: ${artist} - ${title}`);
    
    const response = await axios.get(`${BASE_URL}/get`, {
      params: {
        artist_name: artist,
        track_name: title,
        duration: duration
      }
    });

    if (response.data && response.data.syncedLyrics) {
      return response.data.syncedLyrics;
    }
    
    // Fallback to plain lyrics if synced are not available
    if (response.data && response.data.plainLyrics) {
      return `[00:00.00] ${response.data.plainLyrics.split('\n')[0]}\n[00:05.00] (Synced lyrics not available)`;
    }

    return null;
  } catch (error) {
    console.warn('[Lyric Service Error]', error.message);
    return null;
  }
};
