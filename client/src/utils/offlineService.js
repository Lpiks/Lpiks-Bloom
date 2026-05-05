import * as FileSystem from 'expo-file-system/legacy';

const TRACKS_DIR = `${FileSystem.documentDirectory}tracks/`;
const MAP_FILE = `${TRACKS_DIR}vault_map.json`;

/**
 * Initialize the Local Vault
 */
export const initVault = async () => {
  const dirInfo = await FileSystem.getInfoAsync(TRACKS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(TRACKS_DIR, { intermediates: true });
    console.log('[Offline Vault] Local Directory Created');
  }
  
  // Create empty map if it doesn't exist
  const mapInfo = await FileSystem.getInfoAsync(MAP_FILE);
  if (!mapInfo.exists) {
    await FileSystem.writeAsStringAsync(MAP_FILE, JSON.stringify({}));
  }
};

/**
 * Get the map of all offline tracks
 */
export const getOfflineMap = async () => {
  try {
    await initVault();
    const data = await FileSystem.readAsStringAsync(MAP_FILE);
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

/**
 * Download a track to the Local Vault
 */
export const downloadTrack = async (track, onProgress) => {
  try {
    await initVault();
    
    // Use the streaming API as source
    const streamUrl = `https://lpiks-bloom.onrender.com/api/music/stream?id=${track.id}`;
    const fileUri = `${TRACKS_DIR}${track.id}.mp3`;

    const downloadResumable = FileSystem.createDownloadResumable(
      streamUrl,
      fileUri,
      {},
      (downloadProgress) => {
        if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress(progress);
        }
      }
    );

    const { uri } = await downloadResumable.downloadAsync();
    
    // Save to Map (JSON File) with Parent Metadata
    const offlineMap = await getOfflineMap();
    offlineMap[track.id] = {
      localUri: uri,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      albumId: track.albumId,
      albumTitle: track.albumTitle,
      playlistId: track.playlistId,
      playlistTitle: track.playlistTitle,
      downloadedAt: new Date().toISOString()
    };
    
    await FileSystem.writeAsStringAsync(MAP_FILE, JSON.stringify(offlineMap));
    return uri;
  } catch (error) {
    console.error('[Offline Error] Download failed:', error);
    return null;
  }
};

/**
 * Check if a track is available offline
 */
export const getLocalUri = async (trackId) => {
  const offlineMap = await getOfflineMap();
  return offlineMap[trackId]?.localUri || null;
};

/**
 * Delete a track from the Vault
 */
export const deleteTrack = async (trackId) => {
  try {
    const fileUri = `${TRACKS_DIR}${trackId}.mp3`;
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    
    const offlineMap = await getOfflineMap();
    delete offlineMap[trackId];
    await FileSystem.writeAsStringAsync(MAP_FILE, JSON.stringify(offlineMap));
    return true;
  } catch (error) {
    return false;
  }
};
