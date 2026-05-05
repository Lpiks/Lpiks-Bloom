const axios = require('axios');
const { toSentenceCase } = require('../middleware/mouloudia');

const JAMENDO_CLIENT_ID = '56d30cce'; // Public Demo ID
const BASE_URL = 'https://api.jamendo.com/v3.0';

/**
 * Jamendo Sovereign Service (Hardened)
 */
const searchJamendo = async (query) => {
  try {
    console.log(`[Jamendo] Searching for: ${query}`);
    
    const response = await axios.get(`${BASE_URL}/tracks/`, {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 20,
        search: query, // Broad search across all fields
        audioformat: 'mp32'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.results) {
      console.warn('[Jamendo] No results object in response');
      return [];
    }

    console.log(`[Jamendo] Found ${response.data.results.length} tracks`);

    return response.data.results.map(track => ({
      id: track.id,
      title: toSentenceCase(track.name),
      artist: toSentenceCase(track.artist_name),
      artwork: track.image || track.album_image || 'https://via.placeholder.com/300/0A192F/F1E5AC?text=Lpiks+Bloom',
      url: track.audio,
      duration: track.duration,
      vibe: 'Discovery'
    }));
  } catch (error) {
    console.error('[Jamendo Fatal Error]', error.message);
    if (error.response) {
      console.error('[Jamendo Error Data]', error.response.data);
    }
    return [];
  }
};

module.exports = { searchJamendo };
