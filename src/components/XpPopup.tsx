import { motion, AnimatePresence } from "framer-motion";

interface XpPopupProps {
  amount: number;
  show: boolean;
}

const XpPopup = ({ amount, show }: XpPopupProps) => {
  if (!amount) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, -10, -20, -40], scale: [0.5, 1.2, 1, 0.8] }}
          transition={{ duration: 1.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            +{amount} XP ⚡
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XpPopup;
