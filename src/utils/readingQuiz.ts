import AsyncStorage from '@react-native-async-storage/async-storage';
import { callEdgeFn } from './supabase';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

const DONE_KEY = 'jotminds.readingQuiz.done';
const CACHE_KEY = (id: string) => `jotminds.readingQuiz.q.${id}`;

/** Generate a 3-question comprehension quiz for an article, cached per article. */
export async function getReadingQuiz(
  articleId: string,
  title: string,
  body: string,
): Promise<QuizQuestion[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY(articleId));
    if (cached) {
      const parsed = JSON.parse(cached) as QuizQuestion[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    // ignore
  }

  try {
    const res = await callEdgeFn(
      '/ai/chat',
      {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content:
                `Write 3 multiple-choice comprehension questions about this short article. ` +
                `Each has exactly 4 options and one correct answer. Return ONLY JSON: ` +
                `{"questions":[{"question":"...","options":["..","..","..",".."],"answerIndex":0}]}\n\n` +
                `TITLE: ${title}\n\n${body}`,
            },
          ],
        }),
      },
      30000,
    );
    const text: string = res?.reply ?? '';
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const qs: QuizQuestion[] = (json.questions ?? [])
      .filter((q: any) => Array.isArray(q.options) && q.options.length === 4 && typeof q.answerIndex === 'number')
      .slice(0, 3);
    if (qs.length === 0) return null;
    await AsyncStorage.setItem(CACHE_KEY(articleId), JSON.stringify(qs)).catch(() => {});
    return qs;
  } catch {
    return null;
  }
}

export async function isReadingQuizDone(articleId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(DONE_KEY);
    return raw ? (JSON.parse(raw) as string[]).includes(articleId) : false;
  } catch {
    return false;
  }
}

/** Mark done; returns true only the first time (so XP is awarded once). */
export async function markReadingQuizDone(articleId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(DONE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (list.includes(articleId)) return false;
    list.push(articleId);
    await AsyncStorage.setItem(DONE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
