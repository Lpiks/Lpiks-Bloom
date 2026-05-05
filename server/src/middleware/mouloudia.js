/**
 * Mouloudia Middleware
 * Enforces the "Quiet Luxury" naming standard (Sentence case).
 */

const toSentenceCase = (str) => {
  if (!str) return '';
  const clean = str.toLowerCase().trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const formatMouloudia = (req, res, next) => {
  if (req.body) {
    if (req.body.title) req.body.title = toSentenceCase(req.body.title);
    if (req.body.artist) req.body.artist = toSentenceCase(req.body.artist);
    if (req.body.album) req.body.album = toSentenceCase(req.body.album);
  }
  next();
};

module.exports = { toSentenceCase, formatMouloudia };
