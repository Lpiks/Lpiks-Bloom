const express = require('express');
const router = express.Router();
const scdl = require('soundcloud-downloader').default;
const { resolveSoundCloud } = require('../services/soundcloud');

/**
 * GET /api/music/proxy-stream
 * The SoundCloud Sovereign Pipe: Secure, full-length audio delivery.
 */
router.get('/proxy-stream', async (req, res) => {
  const { artist, title } = req.query;

  if (!artist || !title) return res.status(400).send('Artist and Title required');

  try {
    console.log(`[SoundCloud Proxy] Initializing stream for: ${artist} - ${title}`);
    
    // 1. Resolve the track URL from SoundCloud
    const trackInfo = await resolveSoundCloud(artist, title);
    
    // 2. Set audio headers for the mobile client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 3. Download and Pipe the audio directly to the response
    // scdl.download returns a ReadableStream
    const stream = await scdl.download(trackInfo.url);

    console.log(`[SoundCloud Proxy] Pipe active: ${trackInfo.title}`);
    
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('[SoundCloud Pipe Error]', err.message);
    });

    req.on('close', () => {
      console.log(`[SoundCloud Proxy] Connection closed`);
      if (stream.destroy) stream.destroy();
    });

  } catch (error) {
    console.error('[SoundCloud Proxy Fatal Error]', error.message);
    res.status(500).send('SoundCloud resolution failed');
  }
});

router.get('/stream', async (req, res) => {
  const { artist, title } = req.query;
  const proxyUrl = `http://192.168.100.3:5000/api/music/proxy-stream?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`;
  res.json({ url: proxyUrl });
});

router.post('/ghost-save', async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
