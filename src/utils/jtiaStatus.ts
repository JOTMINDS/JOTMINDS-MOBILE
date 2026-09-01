/**
 * Local-only completion flag + last-report cache for the JTIA (JotMinds
 * Teacher Intelligence Assessment). Mirrors teachingStyleStatus.ts.
 *
 * JTIA results are also synced to the backend (see JTIAAssessmentScreen's
 * finish()), stored under the webapp's `teaching-style` assessment key with
 * a `{ jtia: report }` payload — matching how the webapp persists them. This
 * local flag just gives screens a cheap synchronous-ish completion check
 * without a round-trip.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JTIAReportData } from './jtiaScoring';

const DONE_KEY = 'jotminds.jtiaDone';
const REPORT_KEY = 'jotminds.jtiaReport';

export const markJTIADone = (report?: JTIAReportData): Promise<void> =>
  Promise.all([
    AsyncStorage.setItem(DONE_KEY, 'true'),
    report ? AsyncStorage.setItem(REPORT_KEY, JSON.stringify(report)) : Promise.resolve(),
  ]).then(() => {}).catch(() => {});

export const isJTIADone = (): Promise<boolean> =>
  AsyncStorage.getItem(DONE_KEY).then((v) => v === 'true').catch(() => false);

export const getLastJTIAReport = (): Promise<JTIAReportData | null> =>
  AsyncStorage.getItem(REPORT_KEY)
    .then((v) => (v ? (JSON.parse(v) as JTIAReportData) : null))
    .catch(() => null);
