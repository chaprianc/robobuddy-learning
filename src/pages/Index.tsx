import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RoboAvatar from "@/components/RoboAvatar";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";

const ageGroups = [
  { label: "5–6", value: "5-6" as const, emoji: "🧒" },
  { label: "7–9", value: "7-9" as const, emoji: "👦" },
  { label: "10–12", value: "10-12" as const, emoji: "🧑" },
  { label: "13–14", value: "13-14" as const, emoji: "👨‍🎓" },
];

const GREETING = "היי! שלום לך! אני רובו, החבר שלך ללימודים! בוא נלמד משהו מגניב היום! קודם כל, ספר לי, בן כמה אתה?";

const Index = () => {
  const { setAge } = useRobo();
  const navigate = useNavigate();
  const { isTalking, speak } = useRoboTTS();
  const [showGreeting, setShowGreeting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowGreeting(true);
      speak(GREETING);
    }, 600);
    const t2 = setTimeout(() => setShowButtons(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAge = (val: typeof ageGroups[number]["value"]) => {
    setAge(val);
    navigate("/menu");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Robo - hero size */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      >
        <RoboAvatar size="lg" isTalking={isTalking} />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 bg-card rounded-2xl p-5 shadow-lg border border-border max-w-sm text-center relative"
          >
            {/* Speech bubble arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-t border-l border-border rotate-45" />
            <p className="text-lg font-bold text-foreground leading-relaxed">
              היי! 👋 אני רובו!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              החבר שלך ללימודים 🤖✨
            </p>
            <p className="text-foreground mt-2 text-base">בן כמה אתה?</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Age buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs"
          >
            {ageGroups.map((g, i) => (
              <motion.button
                key={g.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAge(g.value)}
                className="bg-primary text-primary-foreground font-bold text-lg rounded-2xl py-4 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center gap-1"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span>{g.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
