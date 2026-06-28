import * as Haptics from 'expo-haptics';

// Thin wrappers so call sites stay terse and failures never throw.
export const tapLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const tapMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const notifySuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const notifyError = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
export const select = () => Haptics.selectionAsync().catch(() => {});
