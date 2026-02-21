import { motion, AnimatePresence } from "framer-motion";
import { getXpProgress, getXpForNextLevel, LEVEL_TITLES, MAX_LEVEL } from "@/lib/xp-system";

interface XpLevelBarProps {
  xp: number;
  level: number;
  showLevelUp: boolean;
}

const XpLevelBar = ({ xp, level, showLevelUp }: XpLevelBarProps) => {
  const progress = getXpProgress(xp, level);
  const nextLevelXp = getXpForNextLevel(level);
  const title = LEVEL_TITLES[level] || `רמה ${level}`;
  const isMax = level >= MAX_LEVEL;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          key={level}
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-0.5"
        >
          <span className="text-xs font-bold text-primary">Lv.{level}</span>
        </motion.div>
        <span className="text-[10px] text-muted-foreground truncate">{title}</span>
        <span className="text-[10px] text-muted-foreground mr-auto">
          {isMax ? "MAX" : `${xp}/${nextLevelXp}`}
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.3 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-x-0 -top-2 flex justify-center pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
              🎉 עלית לרמה {level}! {LEVEL_TITLES[level]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default XpLevelBar;
