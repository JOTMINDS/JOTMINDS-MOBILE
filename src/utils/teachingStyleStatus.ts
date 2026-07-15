/**
 * Local-only completion flag for the Teaching Style assessment. It's needed
 * because TeachingStyleAssessmentScreen never submits its result to the
 * backend (the score is passed via nav params, not persisted via
 * /assessment/submit — see that screen's finish()), so
 * getAllAssessmentResults() can never reflect completion here.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'jotminds.teachingStyleDone';

export const markTeachingStyleDone = (): Promise<void> =>
  AsyncStorage.setItem(KEY, 'true').catch(() => {});

export const isTeachingStyleDone = (): Promise<boolean> =>
  AsyncStorage.getItem(KEY).then((v) => v === 'true').catch(() => false);
