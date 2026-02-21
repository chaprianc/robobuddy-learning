// XP thresholds per level
export const XP_PER_LEVEL = [
  0,    // Level 1: 0 XP
  50,   // Level 2: 50 XP
  120,  // Level 3: 120 XP
  220,  // Level 4: 220 XP
  350,  // Level 5: 350 XP
  520,  // Level 6: 520 XP
  730,  // Level 7: 730 XP
  1000, // Level 8: 1000 XP
  1350, // Level 9: 1350 XP
  1800, // Level 10: 1800 XP
];

export const MAX_LEVEL = XP_PER_LEVEL.length;

export const LEVEL_TITLES: Record<number, string> = {
  1: "מתחיל 🌱",
  2: "חוקר 🔍",
  3: "לומד 📚",
  4: "מתקדם ⭐",
  5: "מומחה 🧠",
  6: "אלוף 🏆",
  7: "גאון 💡",
  8: "מאסטר 🎓",
  9: "אגדה 🌟",
  10: "אלוף העולם 👑",
};

export const XP_REWARDS = {
  correct: 10,
  streak3: 5,
  streak5: 10,
  streak7: 20,
  quizComplete: 15,
};

export function getLevelFromXp(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return XP_PER_LEVEL[MAX_LEVEL - 1];
  return XP_PER_LEVEL[level]; // level is 1-indexed, array is 0-indexed
}

export function getXpProgress(xp: number, level: number): number {
  if (level >= MAX_LEVEL) return 100;
  const currentLevelXp = XP_PER_LEVEL[level - 1];
  const nextLevelXp = XP_PER_LEVEL[level];
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

export interface BadgeDef {
  key: string;
  name: string;
  icon: string;
  condition: (stats: BadgeCheckStats) => boolean;
}

export interface BadgeCheckStats {
  totalCorrect: number;
  highestStreak: number;
  level: number;
  xp: number;
  modulesPlayed: string[];
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  { key: "first_correct", name: "תשובה ראשונה!", icon: "🎯", condition: (s) => s.totalCorrect >= 1 },
  { key: "ten_correct", name: "10 תשובות נכונות!", icon: "🔟", condition: (s) => s.totalCorrect >= 10 },
  { key: "fifty_correct", name: "50 תשובות!", icon: "🌟", condition: (s) => s.totalCorrect >= 50 },
  { key: "streak_king", name: "מלך הרצף!", icon: "🔥", condition: (s) => s.highestStreak >= 5 },
  { key: "streak_legend", name: "אגדת הרצף!", icon: "⚡", condition: (s) => s.highestStreak >= 10 },
  { key: "level_5", name: "מומחה!", icon: "🧠", condition: (s) => s.level >= 5 },
  { key: "level_10", name: "אלוף העולם!", icon: "👑", condition: (s) => s.level >= 10 },
  { key: "math_hero", name: "גיבור חשבון!", icon: "🔢", condition: (s) => s.modulesPlayed.includes("math") && s.totalCorrect >= 20 },
  { key: "reader", name: "קורא מהיר!", icon: "📖", condition: (s) => s.modulesPlayed.includes("reading") && s.totalCorrect >= 20 },
  { key: "english_star", name: "כוכב אנגלית!", icon: "🇬🇧", condition: (s) => s.modulesPlayed.includes("english") && s.totalCorrect >= 20 },
  { key: "explorer", name: "חוקר!", icon: "🗺️", condition: (s) => s.modulesPlayed.length >= 3 },
];

export function checkNewBadges(stats: BadgeCheckStats, earnedKeys: string[]): BadgeDef[] {
  return BADGE_DEFINITIONS.filter(b => !earnedKeys.includes(b.key) && b.condition(stats));
}
