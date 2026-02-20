import { motion } from "framer-motion";

interface RoboAvatarProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  isTalking?: boolean;
}

const sizeValues = { sm: 96, md: 176, lg: 256 };
const sizeClasses = { sm: "w-24 h-24", md: "w-44 h-44", lg: "w-64 h-64" };

const RoboAvatar = ({ size = "md", animate = true, isTalking = false }: RoboAvatarProps) => {
  const s = sizeValues[size];

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={animate ? { y: [0, -8, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Antenna */}
        <motion.g
          animate={animate ? { rotate: [0, 8, -8, 0] } : undefined}
          transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 } : undefined}
          style={{ originX: "100px", originY: "45px", transformOrigin: "100px 45px" }}
        >
          <line x1="100" y1="45" x2="100" y2="20" stroke="hsl(210, 80%, 55%)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="16" r="6" fill="hsl(210, 80%, 55%)">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </motion.g>

        {/* Head - round */}
        <circle cx="100" cy="77" r="50" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="2" />
        
        {/* Face plate - round */}
        <circle cx="100" cy="77" r="36" fill="hsl(210, 80%, 25%)" />

        {/* Left eye */}
        <g>
          <circle cx="82" cy="72" r="10" fill="white" />
          <circle cx="82" cy="72" r="5" fill="hsl(210, 80%, 55%)">
            <animate attributeName="r" values="5;5;5;5;5" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Blink overlay */}
          <rect x="72" y="62" width="20" height="20" rx="10" fill="hsl(210, 80%, 25%)">
            <animate
              attributeName="height"
              values="0;0;0;0;0;0;0;0;20;0;0;0;0;0;0;0;0;0;0;20;0"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="72;72;72;72;72;72;72;72;62;72;72;72;72;72;72;72;72;72;72;62;72"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Eye shine */}
          <circle cx="79" cy="69" r="2" fill="white" opacity="0.8" />
        </g>

        {/* Right eye */}
        <g>
          <circle cx="118" cy="72" r="10" fill="white" />
          <circle cx="118" cy="72" r="5" fill="hsl(210, 80%, 55%)">
            <animate attributeName="r" values="5;5;5;5;5" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Blink overlay */}
          <rect x="108" y="62" width="20" height="20" rx="10" fill="hsl(210, 80%, 25%)">
            <animate
              attributeName="height"
              values="0;0;0;0;0;0;0;0;20;0;0;0;0;0;0;0;0;0;0;20;0"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="72;72;72;72;72;72;72;72;62;72;72;72;72;72;72;72;72;72;72;62;72"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Eye shine */}
          <circle cx="115" cy="69" r="2" fill="white" opacity="0.8" />
        </g>

        {/* Mouth */}
        {isTalking ? (
          <ellipse cx="100" cy="91" rx="10" ry="5" fill="hsl(0, 80%, 65%)">
            <animate attributeName="ry" values="5;2;7;3;5;8;4;5" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="rx" values="10;8;12;9;10;11;8;10" dur="0.4s" repeatCount="indefinite" />
          </ellipse>
        ) : (
          <path d="M88 88 Q100 98 112 88" stroke="hsl(0, 80%, 65%)" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        {/* Blush */}
        <circle cx="72" cy="85" r="5" fill="hsl(0, 80%, 80%)" opacity="0.5" />
        <circle cx="128" cy="85" r="5" fill="hsl(0, 80%, 80%)" opacity="0.5" />

        {/* Ear left */}
        <circle cx="44" cy="77" r="10" fill="hsl(210, 80%, 55%)" />
        {/* Ear right */}
        <circle cx="156" cy="77" r="10" fill="hsl(210, 80%, 55%)" />

        {/* Body - round */}
        <ellipse cx="100" cy="155" rx="44" ry="34" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="2" />
        
        {/* Chest light */}
        <circle cx="100" cy="145" r="10" fill="hsl(210, 80%, 90%)" stroke="hsl(210, 80%, 55%)" strokeWidth="2">
          <animate attributeName="fill" values="hsl(210,80%,90%);hsl(210,80%,70%);hsl(210,80%,90%)" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="145" r="4" fill="hsl(210, 80%, 55%)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Left arm — waving! */}
        <motion.g
          animate={animate ? { rotate: [0, -25, 0, -25, 0] } : undefined}
          transition={animate ? { duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 } : undefined}
          style={{ transformOrigin: "55px 130px" }}
        >
          <rect x="30" y="125" width="30" height="14" rx="7" fill="hsl(210, 80%, 55%)" />
          {/* Hand */}
          <circle cx="28" cy="132" r="9" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="2" />
          {/* Fingers */}
          <rect x="20" y="124" width="4" height="8" rx="2" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="1" />
          <rect x="25" y="121" width="4" height="10" rx="2" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="1" />
          <rect x="30" y="122" width="4" height="9" rx="2" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="1" />
        </motion.g>

        {/* Right arm */}
        <rect x="140" y="125" width="30" height="14" rx="7" fill="hsl(210, 80%, 55%)" />
        <circle cx="172" cy="132" r="9" fill="white" stroke="hsl(210, 25%, 88%)" strokeWidth="2" />

        {/* Legs */}
        <rect x="76" y="186" width="16" height="20" rx="8" fill="hsl(210, 25%, 40%)" />
        <rect x="108" y="186" width="16" height="20" rx="8" fill="hsl(210, 25%, 40%)" />
        
        {/* Feet */}
        <ellipse cx="80" cy="208" rx="14" ry="6" fill="hsl(210, 80%, 55%)" />
        <ellipse cx="120" cy="208" rx="14" ry="6" fill="hsl(210, 80%, 55%)" />

        {/* Shadow */}
        <ellipse cx="100" cy="215" rx="40" ry="5" fill="hsl(210, 20%, 80%)" opacity="0.3" />
      </svg>
    </motion.div>
  );
};

export default RoboAvatar;
