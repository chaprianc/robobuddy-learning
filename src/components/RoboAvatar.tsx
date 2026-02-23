import { motion } from "framer-motion";
import roboImg from "@/assets/robo-avatar.png";

interface RoboAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  isTalking?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64"
};

const RoboAvatar = ({ size = "md", animate = true, isTalking = false }: RoboAvatarProps) => {
  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}>

      <motion.img
        src={roboImg}
        alt="רובו"
        className="w-full h-full object-contain drop-shadow-xl rounded-xl shadow-xl"
        animate={isTalking ? { scale: [1, 1.03, 1] } : undefined}
        transition={isTalking ? { duration: 0.35, repeat: Infinity } : undefined} />

    </motion.div>);

};

export default RoboAvatar;