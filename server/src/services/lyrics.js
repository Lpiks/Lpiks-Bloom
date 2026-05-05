const axios = require('axios');

const getLyrics = async (artist, track, album, duration) => {
  try {
    const response = await axios.get('https://lrclib.net/api/get', {
      params: { artist, track_name: track, album_name: album, duration }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

module.exports = { getLyrics };
