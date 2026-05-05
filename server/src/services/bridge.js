const play = require('play-dl');

/**
 * Sovereign Audio Bridge (Play-DL Engine)
 * Resolves metadata to full-length audio streams using high-speed extraction.
 */
const resolveStream = async (artist, title) => {
  try {
    const query = `${artist} ${title} official audio`;
    console.log(`[Bridge] Searching with Play-DL: ${query}`);
    
    // 1. Search for the track
    const searchResults = await play.search(query, {
      limit: 1,
      source: { youtube: 'video' }
    });

    if (!searchResults || searchResults.length === 0) {
      throw new Error('No sovereign results found');
    }

    const video = searchResults[0];
    console.log(`[Bridge] Found video: ${video.title} (${video.url})`);

    // 2. Get the stream URL
    // We use the 'stream' method which is much more stable than standard extraction
    const stream = await play.stream(video.url, {
      quality: 2, // High quality
      seek: 0
    });

    if (!stream || !stream.url) {
      throw new Error('Stream extraction failed');
    }

    console.log(`[Bridge] Successfully resolved sovereign stream: ${video.title}`);
    
    return {
      url: stream.url,
      duration: video.durationInSec,
      source: video.url
    };
  } catch (error) {
    console.error('[Bridge Play-DL Error]', error.message);
    throw error;
  }
};

module.exports = { resolveStream };
