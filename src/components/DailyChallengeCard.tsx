import { motion } from "framer-motion";
import { getTodayChallenge, getDailyChallengeState, getConsecutiveDays } from "@/lib/daily-challenge";

interface DailyChallengeCardProps {
  onStart: (module: "math" | "reading" | "english" | "quiz") => void;
}

const DailyChallengeCard = ({ onStart }: DailyChallengeCardProps) => {
  const challenge = getTodayChallenge();
  const state = getDailyChallengeState();
  const consecutiveDays = getConsecutiveDays();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-sm"
    >
      <div className={`relative overflow-hidden rounded-2xl border-2 p-4 shadow-lg ${
        state.completed
          ? "border-secondary/50 bg-secondary/10"
          : "border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5"
      }`}>
        {/* Glow effect */}
        {!state.completed && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
        )}

        <div className="relative flex items-start gap-3">
          <div className="text-3xl">{state.completed ? "✅" : challenge.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-accent-foreground bg-accent/30 px-2 py-0.5 rounded-full">
                ⚡ אתגר יומי
              </span>
              {consecutiveDays > 0 && (
                <span className="text-xs font-medium text-secondary">
                  🔥 {consecutiveDays} ימים ברצף
                </span>
              )}
            </div>
            <h3 className="font-bold text-foreground text-sm">{challenge.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>

            {/* Progress bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (state.progress / challenge.target) * 100)}%` }}
                  className={`h-full rounded-full ${state.completed ? "bg-secondary" : "bg-accent"}`}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {state.progress}/{challenge.target}
              </span>
            </div>

            {state.completed ? (
              <p className="text-xs font-bold text-secondary mt-2">🎉 כל הכבוד! השלמת את האתגר!</p>
            ) : (
              <button
                onClick={() => onStart(challenge.module)}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                בוא נתחיל! →
              </button>
            )}

            <p className="text-[10px] text-muted-foreground mt-1">🏆 פרס: +20 XP בונוס בסיום!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;
