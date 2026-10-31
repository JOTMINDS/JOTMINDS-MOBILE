import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { updateUserProfile } from './api';

/** Side length of the stored avatar. Small enough that the profile row stays light. */
export const AVATAR_SIZE = 256;
/** Largest data URI we will store on the profile (~350KB). */
export const MAX_AVATAR_URI_LENGTH = 350_000;

/**
 * Pick a square photo, downscale it to AVATAR_SIZE and compress it, then persist
 * it on the user's KV profile as a data URI (`avatarUrl`) — no storage bucket needed.
 * The picker only compresses; it does not resize, and a phone photo is several
 * megabytes even at quality 0.5, so the resize here is what makes the upload fit.
 * Returns the new data URI, or null if the user cancelled. Throws a readable
 * Error if photo access is off or the upload fails.
 */
export async function pickAndSaveAvatar(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Photo access is off. Turn it on for JotMinds in your phone’s Settings, then try again.');
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (res.canceled || !res.assets?.[0]?.uri) return null;

  const asset = res.assets[0];
  const small = await manipulateAsync(
    asset.uri,
    [{ resize: { width: AVATAR_SIZE } }],
    { compress: 0.7, format: SaveFormat.JPEG, base64: true },
  );
  if (!small.base64) throw new Error('Could not read that photo. Try a different one.');

  const dataUri = `data:image/jpeg;base64,${small.base64}`;
  // A 256px JPEG is ~20–40KB, so this only trips on something unexpected.
  if (dataUri.length > MAX_AVATAR_URI_LENGTH) {
    throw new Error('That photo is too large. Try a different one.');
  }

  await updateUserProfile({ avatarUrl: dataUri });
  return dataUri;
}

export async function removeAvatar(): Promise<void> {
  await updateUserProfile({ avatarUrl: '' });
}
