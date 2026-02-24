import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import RoboAvatar from "@/components/RoboAvatar";
import ModuleCard from "@/components/ModuleCard";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";

const MENU_GREETING = "מעולה! אז מה תרצה ללמוד היום? יש חשבון, קריאה, אנגלית או חידון ידע!";

type Module = "math" | "reading" | "english" | "quiz";
type Difficulty = "easy" | "medium" | "hard";

const difficultyOptions: { value: Difficulty; label: string; emoji: string; desc: string }[] = [
  { value: "easy", label: "קל", emoji: "🌱", desc: "בואו נתחיל בקלות" },
  { value: "medium", label: "בינוני", emoji: "⭐", desc: "אתגר בדיוק בשבילי" },
  { value: "hard", label: "קשה", emoji: "🔥", desc: "אני מוכן לאתגר!" },
];

const Menu = () => {
  const navigate = useNavigate();
  const { age, setModule, setDifficulty } = useRobo();
  const { isTalking, speak } = useRoboTTS();
  const [pendingModule, setPendingModule] = useState<Module | null>(null);

  useEffect(() => {
    if (!age) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => speak(MENU_GREETING), 500);
    return () => clearTimeout(timer);
  }, [age, navigate]);

  const selectModule = (mod: Module) => {
    setPendingModule(mod);
  };

  const selectDifficulty = (diff: Difficulty) => {
    if (!pendingModule) return;
    setModule(pendingModule);
    setDifficulty(diff);
    setPendingModule(null);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-background to-muted relative">
      <RoboAvatar size="md" isTalking={isTalking} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 mb-8 text-lg font-semibold text-foreground text-center"
      >
        מה תרצה ללמוד היום? 😊
      </motion.p>

      <DailyChallengeCard onStart={(mod) => selectModule(mod)} />

      <div className="w-full max-w-sm space-y-4">
        <ModuleCard icon="🔢" title="חשבון" description="חיבור, חיסור, כפל ועוד תרגילים" onClick={() => selectModule("math")} delay={0.4} />
        <ModuleCard icon="📖" title="קריאה בעברית" description="אותיות, מילים ומשפטים" onClick={() => selectModule("reading")} delay={0.5} />
        <ModuleCard icon="🇬🇧" title="אנגלית" description="מילים ומשפטים באנגלית" onClick={() => selectModule("english")} delay={0.6} />
        <ModuleCard icon="🎮" title="חידון ידע" description="חידון כיף עם 5 שאלות" onClick={() => selectModule("quiz")} delay={0.7} />
        <ModuleCard icon="📖✨" title="סיפור אינטראקטיבי" description="רובו מספר סיפור ואתה בוחר מה קורה!" onClick={() => navigate("/story")} delay={0.8} />
      </div>

      <div className="flex gap-4 mt-8 flex-wrap justify-center">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← חזרה לבחירת גיל
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          onClick={() => navigate("/badges")}
          className="text-sm text-primary hover:opacity-80 transition-opacity font-medium"
        >
          🏆 אוסף התגים
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          onClick={() => navigate("/parent/auth")}
          className="text-sm text-primary hover:opacity-80 transition-opacity font-medium"
        >
          👨‍👩‍👧 כניסת הורים
        </motion.button>
      </div>

      {/* Difficulty Picker Overlay */}
      <AnimatePresence>
        {pendingModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
            onClick={() => setPendingModule(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-foreground text-center mb-2">
                בחר רמת קושי 🎯
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                באיזו רמה תרצה לשחק?
              </p>
              <div className="space-y-3">
                {difficultyOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => selectDifficulty(opt.value)}
                    className="w-full bg-muted hover:bg-accent rounded-2xl p-4 border border-border text-right flex items-center gap-4 transition-colors"
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{opt.label}</h3>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setPendingModule(null)}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                ביטול
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
