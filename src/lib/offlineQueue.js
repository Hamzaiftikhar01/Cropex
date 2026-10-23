/**
 * Cropex Phase 6 — Offline Scan Queue & Low-Bandwidth Engine
 * ==========================================================
 * Enables uninterrupted field diagnosis in rural 2G/EDGE environments
 * across Sindh, Southern Punjab, KPK, and Balochistan.
 */

import { DISEASE_TAXONOMY } from './diseaseTaxonomy.js';

const STORAGE_KEY = 'cropex_offline_diagnostic_queue';
const LOW_BANDWIDTH_KEY = 'cropex_low_bandwidth_mode';

/**
 * Checks whether low-bandwidth rural mode is enabled.
 * @returns {boolean}
 */
export function isLowBandwidthMode() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LOW_BANDWIDTH_KEY) === 'true';
}

/**
 * Sets low-bandwidth rural mode flag.
 * @param {boolean} enabled
 */
export function setLowBandwidthMode(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOW_BANDWIDTH_KEY, enabled ? 'true' : 'false');
}

/**
 * Checks if the device has network connectivity.
 * @returns {boolean}
 */
export function isDeviceOnline() {
  if (typeof navigator === 'undefined') return true;
  return typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
}

/**
 * Subscribes to online/offline network transitions.
 * @param {function} callback - Receives isOnline boolean
 * @returns {function} Cleanup unsubscribe function
 */
export function onNetworkChange(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Retrieves all pending offline scans from local persistence.
 * @returns {Array<object>}
 */
export function getOfflineQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[offlineQueue] Error reading offline queue:', err);
    return [];
  }
}

/**
 * Adds a new crop scan to the offline persistence queue.
 *
 * @param {object} item - { image, cropHint, district, cropName }
 * @returns {object} Queued item with unique id and timestamp
 */
export function addScanToOfflineQueue(item) {
  const queue = getOfflineQueue();
  const newItem = {
    id: `scan_off_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    image: item.image,
    cropHint: item.cropHint || null,
    cropName: item.cropName || item.cropHint || 'Crop',
    district: item.district || 'Field',
    timestamp: new Date().toISOString(),
    status: 'pending', // 'pending' | 'syncing' | 'synced' | 'failed'
  };

  queue.unshift(newItem);
  // Cap queue to 15 items to prevent LocalStorage quota overflow
  const trimmed = queue.slice(0, 15);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('[offlineQueue] Storage quota exceeded while adding scan:', err);
  }

  return newItem;
}

/**
 * Removes a scan from the offline queue by ID.
 * @param {string} id
 */
export function removeScanFromOfflineQueue(id) {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[offlineQueue] Storage error:', err);
  }
}

/**
 * Clears all pending offline scans.
 */
export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Instant offline symptom & first-aid lookup from local taxonomy.
 * Provides immediate field guidance without waiting for server network.
 *
 * @param {string} cropKey - e.g. 'wheat', 'cotton', 'rice'
 * @returns {object|null}
 */
export function getLocalQuickFirstAid(cropKey) {
  if (!cropKey || typeof cropKey !== 'string') return null;
  const key = cropKey.toLowerCase().trim();
  const crop = DISEASE_TAXONOMY[key];

  if (!crop) return null;

  return {
    cropName: crop.name,
    cropNameUr: crop.name_ur,
    commonDiseases: crop.diseases.slice(0, 3).map((d) => ({
      name: d.name,
      nameUr: d.name_ur,
      symptoms: d.symptoms,
      emergencyFirstAid: `Maintain field drainage, avoid excessive nitrogen fertilization, and inspect lower leaves for spore development.`,
      emergencyFirstAidUr: `کھیت میں پانی کا نکاس درست رکھیں اور پتوں کے نچلے حصے پر دھبوں کی جانچ کریں۔`,
    })),
  };
}

/**
 * Compresses an image dataURL specifically for 2G/low-bandwidth rural conditions.
 * Compresses payload down to under 150–200 KB while preserving leaf pathology features.
 *
 * @param {string} dataUrl - Base64 image
 * @param {number} [maxDimension=720]
 * @param {number} [quality=0.55]
 * @returns {Promise<string>} Compressed Base64 dataURL
 */
export function compressImageForLowBandwidth(dataUrl, maxDimension = 720, quality = 0.55) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Force JPEG compression for maximum byte reduction
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Synchronizes pending offline scans with the online /api/analyze service sequentially.
 *
 * @param {function} onProgress - (completedCount, totalCount, lastResult)
 * @returns {Promise<Array<object>>} Array of { id, success, result, error }
 */
export async function syncOfflineQueue(onProgress) {
  const queue = getOfflineQueue();
  const results = [];
  const remaining = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: item.image,
          cropHint: item.cropHint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync HTTP error ${response.status}`);
      }

      const data = await response.json();
      results.push({ id: item.id, success: true, result: data });
    } catch (err) {
      console.warn(`[offlineQueue] Failed to sync scan ${item.id}:`, err);
      results.push({ id: item.id, success: false, error: err.message });
      remaining.push(item);
    }

    if (onProgress) {
      onProgress(i + 1, queue.length, results[results.length - 1]);
    }
  }

  // Update storage to keep only items that failed
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore
  }

  return results;
}
