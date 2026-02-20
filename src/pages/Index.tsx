import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoboAvatar from "@/components/RoboAvatar";
import { useRobo } from "@/lib/robo-context";

const ageGroups = [
  { label: "5–6", value: "5-6" as const },
  { label: "7–9", value: "7-9" as const },
  { label: "10–12", value: "10-12" as const },
  { label: "13–14", value: "13-14" as const },
];

const Index = () => {
  const { setAge } = useRobo();
  const navigate = useNavigate();

  const handleAge = (val: typeof ageGroups[number]["value"]) => {
    setAge(val);
    navigate("/menu");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <RoboAvatar size="lg" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 bg-card rounded-2xl p-6 shadow-lg border border-border max-w-sm text-center"
        >
          <p className="text-xl font-bold text-foreground mb-1">היי 👋 אני רובו!</p>
          <p className="text-muted-foreground">חבר הלמידה שלך. בן כמה אתה?</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs"
      >
        {ageGroups.map((g, i) => (
          <motion.button
            key={g.value}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAge(g.value)}
            className="bg-primary text-primary-foreground font-bold text-lg rounded-xl py-4 shadow-md hover:shadow-lg transition-shadow"
          >
            {g.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default Index;
