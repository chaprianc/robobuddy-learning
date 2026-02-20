import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ModuleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  delay?: number;
}

const ModuleCard = ({ icon, title, description, onClick, delay = 0 }: ModuleCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-border text-right flex items-center gap-4"
    >
      <div className="text-4xl shrink-0">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </motion.button>
  );
};

export default ModuleCard;
