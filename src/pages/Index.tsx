import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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

const playLandingSound = () => {
  try {
    const ctx = new AudioContext();
    // Impact thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // Bounce boing
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(300, ctx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio not supported, skip silently
  }
};

const Index = () => {
  const { setAge } = useRobo();
  const navigate = useNavigate();
  const { isTalking, speak } = useRoboTTS();
  const [showGreeting, setShowGreeting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Play landing sound when Robo lands (~0.7s into animation)
    const tSound = setTimeout(() => playLandingSound(), 700);
    const t1 = setTimeout(() => {
      setShowGreeting(true);
      speak(GREETING);
    }, 1000);
    const t2 = setTimeout(() => setShowButtons(true), 2000);
    return () => { clearTimeout(tSound); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAge = (val: typeof ageGroups[number]["value"]) => {
    setAge(val);
    navigate("/menu");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Robo - dramatic landing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: -300, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={{
          duration: 0.9,
          type: "spring",
          bounce: 0.5,
          stiffness: 120,
          damping: 10,
        }}
      >
        {/* Landing dust effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 2] }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-primary/10 blur-xl pointer-events-none"
        />
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
