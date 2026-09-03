import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * Biometric (Face ID / Touch ID / fingerprint) quick sign-in.
 *
 * After a successful password login the user can opt in; we then keep their
 * email + password in the device keychain (SecureStore, hardware-encrypted)
 * behind a biometric gate. On the login screen they can unlock with a look /
 * touch instead of retyping.
 */

const CREDS_KEY = 'jotminds.bio.creds';
const ENABLED_KEY = 'jotminds.bio.enabled';

export interface BiometricSupport {
  available: boolean;
  /** 'face' | 'fingerprint' | 'iris' | 'biometric' */
  kind: 'face' | 'fingerprint' | 'iris' | 'biometric';
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) return { available: false, kind: 'biometric' };
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const T = LocalAuthentication.AuthenticationType;
    const kind = types.includes(T.FACIAL_RECOGNITION)
      ? 'face'
      : types.includes(T.FINGERPRINT)
        ? 'fingerprint'
        : types.includes(T.IRIS)
          ? 'iris'
          : 'biometric';
    return { available: true, kind };
  } catch {
    return { available: false, kind: 'biometric' };
  }
}

export function biometricLabel(kind: BiometricSupport['kind']): string {
  return kind === 'face' ? 'Face ID' : kind === 'fingerprint' ? 'fingerprint' : kind === 'iris' ? 'iris scan' : 'biometrics';
}

export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(ENABLED_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function prompt(reason: string): Promise<boolean> {
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return res.success;
}

/** Opt in: verify identity once, then stash credentials behind the biometric gate. */
export async function enableBiometricLogin(email: string, password: string): Promise<boolean> {
  const ok = await prompt('Confirm to enable quick sign-in');
  if (!ok) return false;
  await SecureStore.setItemAsync(CREDS_KEY, JSON.stringify({ email, password }), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(ENABLED_KEY, 'true');
  return true;
}

export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CREDS_KEY);
    await SecureStore.deleteItemAsync(ENABLED_KEY);
  } catch {
    // ignore
  }
}

/** Unlock: gate on biometrics, then return the stored credentials for the caller to sign in with. */
export async function biometricSignIn(): Promise<{ email: string; password: string } | null> {
  if (!(await isBiometricLoginEnabled())) return null;
  const ok = await prompt('Unlock JotMinds');
  if (!ok) return null;
  try {
    const raw = await SecureStore.getItemAsync(CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed?.password) return parsed;
    return null;
  } catch {
    return null;
  }
}
