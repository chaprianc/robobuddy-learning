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

      {/* Blinking eyes overlay */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 flex gap-[18%]">
        <motion.div
          className="w-[10%] h-[10%] bg-primary rounded-full"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
          style={{ width: 8, height: 8 }}
        />
        <motion.div
          className="w-[10%] h-[10%] bg-primary rounded-full"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
          style={{ width: 8, height: 8 }}
        />
      </div>

      {/* Animated mouth overlay */}
      {isTalking && (
        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 flex items-center justify-center">
          <motion.div
            className="bg-foreground/80 rounded-full"
            animate={{
              width: ["12%", "18%", "10%", "20%", "14%"],
              height: ["4px", "10px", "3px", "12px", "5px"],
              borderRadius: ["9999px", "30%", "9999px", "40%", "9999px"],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "14%", height: "6px" }}
          />
        </div>
      )}

    </motion.div>);

};

export default RoboAvatar;