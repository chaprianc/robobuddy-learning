import { motion } from "framer-motion";
import roboImage from "@/assets/robo-character.png";

interface RoboAvatarProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
};

const RoboAvatar = ({ size = "md", animate = true }: RoboAvatarProps) => {
  return (
    <motion.div
      className={`${sizes[size]} relative`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <img src={roboImage} alt="רובו" className="w-full h-full object-contain drop-shadow-lg" />
    </motion.div>
  );
};

export default RoboAvatar;
