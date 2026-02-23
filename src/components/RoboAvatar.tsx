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

      {/* Blinking eyelids that close over the eyes */}
      <motion.div
        className="absolute bg-white rounded-full"
        style={{ top: '14%', left: '39.5%', width: '8%', height: '8%' }}
        animate={{ scaleY: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, times: [0, 0.42, 0.46, 0.54, 0.58, 1] }}
      />
      <motion.div
        className="absolute bg-white rounded-full"
        style={{ top: '14%', left: '52.5%', width: '8%', height: '8%' }}
        animate={{ scaleY: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, times: [0, 0.42, 0.46, 0.54, 0.58, 1] }}
      />

      {/* Animated mouth overlay */}
      {isTalking && (
        <motion.div
          className="absolute bg-foreground/60 rounded-full"
          style={{ top: '22%', left: '45%', width: '10%' }}
          animate={{
            height: ['2%', '4%', '1.5%', '5%', '2%'],
            borderRadius: ['9999px', '30%', '9999px', '40%', '9999px'],
          }}
          transition={{
            duration: 0.35,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

    </motion.div>);
};

export default RoboAvatar;
