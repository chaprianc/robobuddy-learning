import { motion, AnimatePresence } from "framer-motion";

interface BadgePopupProps {
  badge: { name: string; icon: string } | null;
}

const BadgePopup = ({ badge }: BadgePopupProps) => {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.name}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.3 }}
          transition={{ type: "spring", damping: 12 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-card border-2 border-primary shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1.3, 1.1, 1.1, 1] }}
              transition={{ duration: 0.8 }}
              className="text-5xl"
            >
              {badge.icon}
            </motion.div>
            <p className="text-lg font-bold text-foreground">תג חדש!</p>
            <p className="text-sm font-medium text-primary">{badge.name}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgePopup;
