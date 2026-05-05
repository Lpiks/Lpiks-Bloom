const axios = require('axios');
const { toSentenceCase } = require('../middleware/mouloudia');

/**
 * Deezer Hybrid Discovery Service
 * Fetches Tracks, Albums, and Playlists.
 */
const searchDeezer = async (query) => {
  try {
    const [tracksRes, albumsRes, playlistsRes, artistsRes] = await Promise.all([
      axios.get(`https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=5`),
      axios.get(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=10`),
      axios.get(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=10`),
      axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=10`)
    ]);

    const tracks = (tracksRes.data.data || []).map(track => ({
      type: 'track',
      id: track.id,
      title: toSentenceCase(track.title),
      artist: toSentenceCase(track.artist.name),
      artwork: track.album.cover_medium,
      duration: track.duration,
      preview: track.preview
    }));

    const albums = (albumsRes.data.data || []).map(album => ({
      type: 'album',
      id: album.id,
      title: toSentenceCase(album.title),
      artist: toSentenceCase(album.artist.name),
      artwork: album.cover_medium,
      nb_tracks: album.nb_tracks
    }));

    const playlists = (playlistsRes.data.data || []).map(playlist => ({
      type: 'playlist',
      id: playlist.id,
      title: toSentenceCase(playlist.title),
      creator: toSentenceCase(playlist.user.name),
      artwork: playlist.picture_medium,
      nb_tracks: playlist.nb_tracks
    }));

    const artists = (artistsRes.data.data || []).map(artist => ({
      type: 'artist',
      id: artist.id,
      name: toSentenceCase(artist.name),
      artwork: artist.picture_medium,
      nb_fans: artist.nb_fan
    }));

    return { tracks, albums, playlists, artists };
  } catch (error) {
    console.error('[Deezer Hybrid Error]', error.message);
    return { tracks: [], albums: [], playlists: [], artists: [] };
  }
};

/**
 * Fetch Global Trending / Editorial data for the Home Page
 */
const getTrending = async () => {
  try {
    const response = await axios.get('https://api.deezer.com/chart');
    const data = response.data;

    return {
      tracks: (data.tracks?.data || []).map(track => ({
        type: 'track',
        id: track.id,
        title: toSentenceCase(track.title),
        artist: toSentenceCase(track.artist.name),
        artwork: track.album.cover_medium,
        duration: track.duration
      })),
      albums: (data.albums?.data || []).map(album => ({
        type: 'album',
        id: album.id,
        title: toSentenceCase(album.title),
        artist: toSentenceCase(album.artist.name),
        artwork: album.cover_medium
      })),
      playlists: (data.playlists?.data || []).map(playlist => ({
        type: 'playlist',
        id: playlist.id,
        title: toSentenceCase(playlist.title),
        artwork: playlist.picture_medium
      }))
    };
  } catch (error) {
    console.error('[Deezer Chart Error]', error.message);
    return { tracks: [], albums: [], playlists: [] };
  }
};

/**
 * Fetch Full Album Details (with tracks)
 */
const getAlbumDetails = async (id) => {
  try {
    const response = await axios.get(`https://api.deezer.com/album/${id}`);
    const data = response.data;
    return {
      id: data.id,
      title: toSentenceCase(data.title),
      artist: toSentenceCase(data.artist.name),
      artwork: data.cover_xl,
      release_date: data.release_date,
      tracks: (data.tracks?.data || []).map(track => ({
        type: 'track',
        id: track.id,
        title: toSentenceCase(track.title),
        artist: toSentenceCase(data.artist.name),
        artwork: data.cover_medium,
        duration: track.duration
      }))
    };
  } catch (error) {
    console.error('[Deezer Album Detail Error]', error.message);
    return null;
  }
};

/**
 * Fetch Full Playlist Details (with tracks)
 */
const getPlaylistDetails = async (id) => {
  try {
    const response = await axios.get(`https://api.deezer.com/playlist/${id}`);
    const data = response.data;
    return {
      id: data.id,
      title: toSentenceCase(data.title),
      creator: toSentenceCase(data.user.name),
      artwork: data.picture_xl,
      nb_tracks: data.nb_tracks,
      tracks: (data.tracks?.data || []).map(track => ({
        type: 'track',
        id: track.id,
        title: toSentenceCase(track.title),
        artist: toSentenceCase(track.artist.name),
        artwork: track.album.cover_medium,
        duration: track.duration
      }))
    };
  } catch (error) {
    console.error('[Deezer Playlist Detail Error]', error.message);
    return null;
  }
};

/**
 * Fetch Full Artist Details (Top tracks + Albums)
 */
const getArtistDetails = async (id) => {
  try {
    const [artistRes, topTracksRes, albumsRes] = await Promise.all([
      axios.get(`https://api.deezer.com/artist/${id}`),
      axios.get(`https://api.deezer.com/artist/${id}/top?limit=10`),
      axios.get(`https://api.deezer.com/artist/${id}/albums?limit=20`)
    ]);

    const artist = artistRes.data;
    
    return {
      id: artist.id,
      name: toSentenceCase(artist.name),
      artwork: artist.picture_xl,
      nb_fans: artist.nb_fan,
      topTracks: (topTracksRes.data.data || []).map(track => ({
        type: 'track',
        id: track.id,
        title: toSentenceCase(track.title),
        artist: toSentenceCase(artist.name),
        artwork: track.album.cover_medium,
        duration: track.duration
      })),
      albums: (albumsRes.data.data || []).map(album => ({
        type: 'album',
        id: album.id,
        title: toSentenceCase(album.title),
        artwork: album.cover_medium,
        release_date: album.release_date
      }))
    };
  } catch (error) {
    console.error('[Deezer Artist Detail Error]', error.message);
    return null;
  }
};

module.exports = { 
  searchDeezer, 
  getTrending, 
  getAlbumDetails, 
  getPlaylistDetails,
  getArtistDetails 
};
