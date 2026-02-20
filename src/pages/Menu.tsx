import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RoboAvatar from "@/components/RoboAvatar";
import ModuleCard from "@/components/ModuleCard";
import { useRobo } from "@/lib/robo-context";
import { useEffect } from "react";

const Menu = () => {
  const navigate = useNavigate();
  const { age, setModule } = useRobo();

  useEffect(() => {
    if (!age) navigate("/");
  }, [age, navigate]);

  const go = (mod: "homework" | "english" | "quiz") => {
    setModule(mod);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-background to-muted">
      <RoboAvatar size="md" />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 mb-8 text-lg font-semibold text-foreground text-center"
      >
        מה תרצה לעשות היום? 😊
      </motion.p>

      <div className="w-full max-w-sm space-y-4">
        <ModuleCard icon="📚" title="שיעורי בית" description="רובו יעזור לך להבין ולפתור" onClick={() => go("homework")} delay={0.4} />
        <ModuleCard icon="🇬🇧" title="אנגלית" description="בוא נתרגל מילים ומשפטים" onClick={() => go("english")} delay={0.5} />
        <ModuleCard icon="🎮" title="משחק ידע" description="חידון כיף עם 5 שאלות" onClick={() => go("quiz")} delay={0.6} />
      </div>

      <div className="flex gap-4 mt-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← חזרה לבחירת גיל
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
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
