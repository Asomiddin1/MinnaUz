import type { KitsuneState } from './assets';

export type ProgressSaveState = 'idle' | 'saving' | 'saved' | 'error';

export function lessonKitsuneState({
  activeTab, submitted, score, completed, saveState,
}: {
  activeTab: string;
  submitted: boolean;
  score: number | null;
  completed: boolean;
  saveState: ProgressSaveState;
}): KitsuneState {
  if (saveState === 'error') return 'encouraging';
  if (saveState === 'saving') return 'thinking';
  if (activeTab === 'renshuu') {
    if (!submitted || score === null) return 'thinking';
    return score >= 70 ? 'celebrating' : 'encouraging';
  }
  return completed ? 'celebrating' : 'studying';
}

// The API is authoritative: JLPT thresholds differ from a lesson quiz's 70%.
export function testKitsuneState(isPassed: boolean): KitsuneState {
  return isPassed ? 'celebrating' : 'encouraging';
}
