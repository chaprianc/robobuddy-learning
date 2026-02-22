import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRobo } from "@/lib/robo-context";
import { BADGE_DEFINITIONS } from "@/lib/xp-system";
import RoboAvatar from "@/components/RoboAvatar";

const BADGE_DESCRIPTIONS: Record<string, string> = {
  first_correct: "ענית נכון על השאלה הראשונה שלך!",
  ten_correct: "ענית נכון על 10 שאלות - כל הכבוד!",
  fifty_correct: "50 תשובות נכונות! אתה מכונה!",
  streak_king: "השגת רצף של 5 תשובות נכונות ברצף!",
  streak_legend: "רצף מטורף של 10 תשובות נכונות!",
  level_5: "הגעת לרמה 5 - אתה מומחה אמיתי!",
  level_10: "רמה 10! אין מי שיעצור אותך!",
  math_hero: "פתרת 20 תרגילי חשבון נכון!",
  reader: "קראת והבנת 20 טקסטים בעברית!",
  english_star: "ענית נכון על 20 שאלות באנגלית!",
  explorer: "שיחקת בלפחות 3 מודולים שונים!",
};

const Badges = () => {
  const navigate = useNavigate();
  const { earnedBadgeKeys } = useRobo();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-background to-muted" dir="rtl">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate(-1)}
        className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה
      </motion.button>

      <RoboAvatar size="sm" isTalking={false} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground mt-4 mb-2"
      >
        🏆 אוסף התגים שלי
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground mb-8"
      >
        {earnedBadgeKeys.length} מתוך {BADGE_DEFINITIONS.length} תגים נאספו
      </motion.p>

      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        {BADGE_DEFINITIONS.map((badge, i) => {
          const earned = earnedBadgeKeys.includes(badge.key);
          return (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", damping: 15 }}
              className={`relative rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all ${
                earned
                  ? "bg-card border-primary/30 shadow-md"
                  : "bg-muted/50 border-border opacity-50 grayscale"
              }`}
            >
              <motion.span
                className="text-4xl"
                animate={earned ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
              >
                {earned ? badge.icon : "🔒"}
              </motion.span>
              <p className="text-sm font-bold text-foreground leading-tight">
                {badge.name}
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                {BADGE_DESCRIPTIONS[badge.key] || ""}
              </p>
              {earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Badges;
