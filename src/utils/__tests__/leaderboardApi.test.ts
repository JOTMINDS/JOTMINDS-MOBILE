jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

import { initialsFor } from '../leaderboardApi';

describe('initialsFor', () => {
  it('takes the first letter of up to three names, uppercased', () => {
    expect(initialsFor('Ama Serwaa Boateng')).toBe('ASB');
    expect(initialsFor('kojo mensah')).toBe('KM');
    expect(initialsFor('Nana Kwame Owusu Ansah')).toBe('NKO');
  });

  it('strips non-letters and handles empty / missing names', () => {
    expect(initialsFor('  ')).toBe('??');
    expect(initialsFor(undefined)).toBe('??');
    expect(initialsFor('J.R.')).toBe('J');
  });
});
