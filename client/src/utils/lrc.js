/**
 * LRC Parser Utility
 * Converts standard LRC strings into a timestamped array of objects.
 * Enforces "Mouloudia" Sentence Case standard.
 */
export const parseLRC = (lrcString) => {
  if (!lrcString) return [];

  const lines = lrcString.split('\n');
  const lyrics = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      
      const timestamp = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
      let text = line.replace(timeRegex, '').trim();

      // Apply "Mouloudia" Sentence Case
      if (text) {
        text = text.toLowerCase();
        text = text.charAt(0).toUpperCase() + text.slice(1);
        lyrics.push({ timestamp, text });
      }
    }
  });

  return lyrics.sort((a, b) => a.timestamp - b.timestamp);
};
