const mockRequestPerm = jest.fn();
const mockLaunch = jest.fn();
const mockManipulate = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (...a: any[]) => mockRequestPerm(...a),
  launchImageLibraryAsync: (...a: any[]) => mockLaunch(...a),
  MediaTypeOptions: { Images: 'Images' },
}));
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: (...a: any[]) => mockManipulate(...a),
  SaveFormat: { JPEG: 'jpeg' },
}));
jest.mock('../api', () => ({ updateUserProfile: (...a: any[]) => mockUpdateProfile(...a) }));

import { pickAndSaveAvatar, AVATAR_SIZE, MAX_AVATAR_URI_LENGTH } from '../avatar';

beforeEach(() => {
  jest.clearAllMocks();
  mockRequestPerm.mockResolvedValue({ granted: true });
  mockUpdateProfile.mockResolvedValue({ success: true });
});

describe('pickAndSaveAvatar', () => {
  it('resizes a large photo down before saving it, so a normal phone photo is accepted', async () => {
    mockLaunch.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///big-4000px.jpg' }] });
    mockManipulate.mockResolvedValue({ base64: 'A'.repeat(30_000) });

    const uri = await pickAndSaveAvatar();

    expect(mockManipulate).toHaveBeenCalledWith(
      'file:///big-4000px.jpg',
      [{ resize: { width: AVATAR_SIZE } }],
      expect.objectContaining({ base64: true, format: 'jpeg' }),
    );
    expect(uri).toBe(`data:image/jpeg;base64,${'A'.repeat(30_000)}`);
    expect(uri!.length).toBeLessThan(MAX_AVATAR_URI_LENGTH);
    expect(mockUpdateProfile).toHaveBeenCalledWith({ avatarUrl: uri });
  });

  it('returns null without saving when the user cancels', async () => {
    mockLaunch.mockResolvedValue({ canceled: true, assets: null });
    await expect(pickAndSaveAvatar()).resolves.toBeNull();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('explains how to fix it when photo access is off, instead of failing silently', async () => {
    mockRequestPerm.mockResolvedValue({ granted: false });
    await expect(pickAndSaveAvatar()).rejects.toThrow(/Photo access is off/);
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it('surfaces a save failure so the screen can show it and keep the old photo', async () => {
    mockLaunch.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///p.jpg' }] });
    mockManipulate.mockResolvedValue({ base64: 'A'.repeat(1000) });
    mockUpdateProfile.mockRejectedValue(new Error('Failed to update profile'));
    await expect(pickAndSaveAvatar()).rejects.toThrow('Failed to update profile');
  });
});
