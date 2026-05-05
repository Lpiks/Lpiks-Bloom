const scdl = require('soundcloud-downloader').default;

/**
 * SoundCloud Sovereign Service
 * Resolves metadata to full-length audio streams via SoundCloud.
 */
const resolveSoundCloud = async (artist, title) => {
  try {
    const query = `${artist} - ${title}`;
    console.log(`[SoundCloud] Resolving: ${query}`);
    
    // Search for the track on SoundCloud
    const searchResults = await scdl.search({
      query: query,
      resourceType: 'tracks',
      limit: 1
    });

    if (!searchResults || !searchResults.collection || searchResults.collection.length === 0) {
      throw new Error('No sovereign results on SoundCloud');
    }

    const track = searchResults.collection[0];
    console.log(`[SoundCloud] Found: ${track.title} (${track.permalink_url})`);

    // Get the high-quality stream URL
    // We'll use the 'download' or 'stream' method in the proxy route
    return {
      url: track.permalink_url,
      duration: Math.floor(track.duration / 1000), // convert ms to s
      source: 'soundcloud',
      artwork: track.artwork_url,
      title: track.title,
      artist: track.user.username
    };
  } catch (error) {
    console.error('[SoundCloud Error]', error.message);
    throw error;
  }
};

module.exports = { resolveSoundCloud };
