import { motion, AnimatePresence } from "framer-motion";


interface StreakCounterProps {
  streak: number;
  showCelebration: boolean;
}

const StreakCounter = ({ streak, showCelebration }: StreakCounterProps) => {
  if (streak === 0) return null;

  const isFire = streak >= 3;
  const isSuper = streak >= 5;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5"
      >
        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-colors ${
            isSuper
              ? "bg-orange-500/20 text-orange-500"
              : isFire
              ? "bg-yellow-500/20 text-yellow-600"
              : "bg-primary/10 text-primary"
          }`}
        >
          <motion.div
            animate={showCelebration ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isSuper ? "🔥" : isFire ? "⚡" : "⭐"}
          </motion.div>
          <span>{streak}</span>
        </div>

        {showCelebration && streak >= 3 && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, -5, -10, -20], scale: [0.5, 1.2, 1, 0.8] }}
            transition={{ duration: 1.2 }}
            className="text-xs font-bold text-orange-500 whitespace-nowrap"
          >
            {streak >= 7 ? "אלוף העולם! 🏆" : streak >= 5 ? "בלתי ניתן לעצירה! 🚀" : "רצף מדהים! 🎯"}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StreakCounter;