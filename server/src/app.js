const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const diaryRoutes = require('./routes/diary');
const musicRoutes = require('./routes/music');
const favoritesRoutes = require('./routes/favorites');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));

// Routes
app.use('/api/diary', diaryRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/favorites', favoritesRoutes);

// Discovery Search Route (Matrix Search)
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query required' });

  try {
    const { searchDeezer } = require('./services/deezer');
    const results = await searchDeezer(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trending Discovery Route
app.get('/api/trending', async (req, res) => {
  try {
    const { getTrending } = require('./services/deezer');
    const results = await getTrending();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Album Detail Route
app.get('/api/album/:id', async (req, res) => {
  try {
    const { getAlbumDetails } = require('./services/deezer');
    const results = await getAlbumDetails(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Playlist Detail Route
app.get('/api/playlist/:id', async (req, res) => {
  try {
    const { getPlaylistDetails } = require('./services/deezer');
    const results = await getPlaylistDetails(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Artist Detail Route
app.get('/api/artist/:id', async (req, res) => {
  try {
    const { getArtistDetails } = require('./services/deezer');
    const results = await getArtistDetails(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Lpiks Bloom Foundation Online' });
});

module.exports = app;
