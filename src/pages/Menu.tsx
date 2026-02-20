import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import RoboAvatar from "@/components/RoboAvatar";
import ModuleCard from "@/components/ModuleCard";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";

const MENU_GREETING = "מעולה! אז מה תרצה ללמוד היום? יש חשבון, קריאה, אנגלית או חידון ידע!";

const Menu = () => {
  const navigate = useNavigate();
  const { age, setModule } = useRobo();
  const { isTalking, speak } = useRoboTTS();

  useEffect(() => {
    if (!age) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => speak(MENU_GREETING), 500);
    return () => clearTimeout(timer);
  }, [age, navigate]);

  const go = (mod: "math" | "reading" | "english" | "quiz") => {
    setModule(mod);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-background to-muted">
      <RoboAvatar size="md" isTalking={isTalking} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 mb-8 text-lg font-semibold text-foreground text-center"
      >
        מה תרצה ללמוד היום? 😊
      </motion.p>

      <div className="w-full max-w-sm space-y-4">
        <ModuleCard icon="🔢" title="חשבון" description="חיבור, חיסור, כפל ועוד תרגילים" onClick={() => go("math")} delay={0.4} />
        <ModuleCard icon="📖" title="קריאה בעברית" description="אותיות, מילים ומשפטים" onClick={() => go("reading")} delay={0.5} />
        <ModuleCard icon="🇬🇧" title="אנגלית" description="מילים ומשפטים באנגלית" onClick={() => go("english")} delay={0.6} />
        <ModuleCard icon="🎮" title="חידון ידע" description="חידון כיף עם 5 שאלות" onClick={() => go("quiz")} delay={0.7} />
      </div>

      <div className="flex gap-4 mt-8">
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
          transition={{ delay: 1.0 }}
          onClick={() => navigate("/parent/auth")}
          className="text-sm text-primary hover:opacity-80 transition-opacity font-medium"
        >
          👨‍👩‍👧 כניסת הורים
        </motion.button>
      </div>
    </div>
  );
};

export default Menu;
