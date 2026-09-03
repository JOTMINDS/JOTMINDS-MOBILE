import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from './api';

/**
 * Pick a square photo, downscale + compress it, and persist it on the user's
 * KV profile as a data URI (`avatarUrl`). Kept small (~256px, JPEG q0.5) so
 * it fits comfortably in a KV row — no storage bucket needed.
 * Returns the new data URI, or null if cancelled / denied.
 */
export async function pickAndSaveAvatar(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });
  if (res.canceled || !res.assets?.[0]?.base64) return null;

  const asset = res.assets[0];
  const mime = asset.mimeType || 'image/jpeg';
  const dataUri = `data:${mime};base64,${asset.base64}`;

  // Guard against oversized images landing in a KV row (~350KB base64 cap).
  if (dataUri.length > 350_000) {
    throw new Error('That image is too large. Try cropping it smaller.');
  }

  await updateUserProfile({ avatarUrl: dataUri });
  return dataUri;
}

export async function removeAvatar(): Promise<void> {
  await updateUserProfile({ avatarUrl: '' });
}
