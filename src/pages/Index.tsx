import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import RoboAvatar from "@/components/RoboAvatar";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";

const GREETING = "היי! אני רובו, החבר שלך! לחץ על הכפתור ובוא נדבר!";

const playLandingSound = () => {
  try {
    const ctx = new AudioContext();
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
    // Audio not supported
  }
};

const Index = () => {
  const { setModule } = useRobo();
  const navigate = useNavigate();
  const { isTalking, speak } = useRoboTTS();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const tSound = setTimeout(() => playLandingSound(), 700);
    const t1 = setTimeout(() => {
      setShowContent(true);
      speak(GREETING);
    }, 1000);
    return () => { clearTimeout(tSound); clearTimeout(t1); };
  }, []);

  const handleStart = () => {
    setModule("free");
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-muted overflow-hidden gap-4">
      {/* Robo - drop & bounce */}
      <motion.div
        initial={{ opacity: 0, y: -400 }}
        animate={{
          opacity: [0, 1, 1, 1, 1, 1],
          y: [-400, 0, -60, 0, -20, 0],
          scaleY: [1, 0.85, 1.1, 0.95, 1.02, 1],
          scaleX: [1, 1.15, 0.95, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.35, 0.55, 0.7, 0.85, 1],
          ease: "easeOut",
        }}
      >
        <RoboAvatar size="xl" isTalking={isTalking} />
      </motion.div>

      {/* Dust */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.3, scaleY: 0.1 }}
        animate={{ opacity: [0, 0.5, 0], scaleX: [0.3, 1.5, 2], scaleY: [0.1, 0.3, 0.1] }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-48 h-12 -mt-6 rounded-[50%] bg-primary/15 blur-md pointer-events-none"
      />

      {/* Speech bubble + button */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="bg-card rounded-2xl p-5 shadow-lg border border-border max-w-xs text-center relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-t border-l border-border rotate-45" />
              <p className="text-lg font-bold text-foreground leading-relaxed">
                היי! 👋 אני רובו!
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                בוא נדבר ונלמד ביחד! 🤖✨
              </p>
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleStart}
              className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 shadow-lg flex items-center gap-3 font-bold text-lg hover:shadow-xl transition-shadow"
            >
              <MessageCircle className="w-6 h-6" />
              בוא נתחיל! 🚀
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;