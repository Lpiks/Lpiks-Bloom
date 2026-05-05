/**
 * LRC Parser Utility
 * Converts standard LRC strings into a timestamped array of objects.
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
      
      // Convert to total seconds
      const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        lyrics.push({ time, text });
      }
    }
  });

  return lyrics.sort((a, b) => a.time - b.time);
};
