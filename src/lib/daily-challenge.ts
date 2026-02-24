export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  module: "math" | "reading" | "english" | "quiz";
  target: number; // number of correct answers needed
  emoji: string;
}

const CHALLENGES: DailyChallenge[] = [
  { id: "math3", title: "אלוף החשבון", description: "ענה נכון על 3 תרגילי חשבון", module: "math", target: 3, emoji: "🔢" },
  { id: "math5", title: "מתמטיקאי על", description: "ענה נכון על 5 תרגילי חשבון", module: "math", target: 5, emoji: "🧮" },
  { id: "read3", title: "קורא מהיר", description: "ענה נכון על 3 שאלות קריאה", module: "reading", target: 3, emoji: "📖" },
  { id: "eng3", title: "English Star", description: "ענה נכון על 3 שאלות באנגלית", module: "english", target: 3, emoji: "🇬🇧" },
  { id: "quiz4", title: "מלך החידון", description: "ענה נכון על 4 שאלות חידון", module: "quiz", target: 4, emoji: "🎮" },
  { id: "math7", title: "מאסטר מספרים", description: "ענה נכון על 7 תרגילי חשבון", module: "math", target: 7, emoji: "💯" },
  { id: "read5", title: "סופר קורא", description: "ענה נכון על 5 שאלות קריאה", module: "reading", target: 5, emoji: "📚" },
  { id: "eng5", title: "English Pro", description: "ענה נכון על 5 שאלות באנגלית", module: "english", target: 5, emoji: "⭐" },
];

const STORAGE_KEY = "robo_daily_challenge";

interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  challengeIndex: number;
  progress: number;
  completed: boolean;
  consecutiveDays: number;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getDailyChallengeState(): DailyChallengeState {
  const raw = localStorage.getItem(STORAGE_KEY);
  const today = getTodayStr();

  if (raw) {
    try {
      const state: DailyChallengeState = JSON.parse(raw);
      if (state.date === today) return state;

      // New day — pick new challenge, check consecutive
      const consecutive = state.date === getYesterdayStr() && state.completed
        ? state.consecutiveDays + 1
        : state.completed ? 1 : 0;

      const newIndex = (state.challengeIndex + 1) % CHALLENGES.length;
      const newState: DailyChallengeState = {
        date: today,
        challengeIndex: newIndex,
        progress: 0,
        completed: false,
        consecutiveDays: consecutive,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    } catch {
      // fall through
    }
  }

  // First time
  const seedIndex = Math.floor(Math.random() * CHALLENGES.length);
  const newState: DailyChallengeState = {
    date: today,
    challengeIndex: seedIndex,
    progress: 0,
    completed: false,
    consecutiveDays: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
}

export function getTodayChallenge(): DailyChallenge {
  const state = getDailyChallengeState();
  return CHALLENGES[state.challengeIndex];
}

export function recordChallengeProgress(module: string): { completed: boolean; bonusXp: number } {
  const state = getDailyChallengeState();
  const challenge = CHALLENGES[state.challengeIndex];

  if (state.completed || module !== challenge.module) {
    return { completed: false, bonusXp: 0 };
  }

  state.progress += 1;
  if (state.progress >= challenge.target) {
    state.completed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { completed: true, bonusXp: 20 }; // Double XP bonus
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return { completed: false, bonusXp: 0 };
}

export function getConsecutiveDays(): number {
  return getDailyChallengeState().consecutiveDays;
}
