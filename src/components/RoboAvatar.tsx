import { motion } from "framer-motion";

interface RoboAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  isTalking?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

const RoboAvatar = ({ size = "md", animate = true, isTalking = false }: RoboAvatarProps) => {
  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        {/* Glow behind */}
        <circle cx="100" cy="100" r="90" fill="hsl(210, 80%, 55%)" opacity="0.08" />

        {/* Antenna */}
        <motion.g
          animate={animate ? { rotate: [0, 10, -10, 0] } : undefined}
          transition={animate ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : undefined}
          style={{ transformOrigin: "100px 35px" }}
        >
          <line x1="100" y1="35" x2="100" y2="12" stroke="hsl(45, 95%, 60%)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="9" r="7" fill="hsl(45, 95%, 60%)">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="9" r="4" fill="hsl(45, 95%, 75%)" />
        </motion.g>

        {/* Main head - big rounded square */}
        <rect x="28" y="30" width="144" height="120" rx="40" fill="hsl(210, 80%, 55%)" />
        <rect x="34" y="36" width="132" height="108" rx="36" fill="hsl(210, 85%, 62%)" />
        
        {/* Face screen */}
        <rect x="42" y="44" width="116" height="80" rx="28" fill="hsl(220, 30%, 18%)" />
        <rect x="46" y="48" width="108" height="72" rx="24" fill="hsl(220, 35%, 22%)" />

        {/* Left eye */}
        <g>
          <circle cx="74" cy="78" r="16" fill="white" />
          <circle cx="74" cy="78" r="9" fill="hsl(160, 60%, 45%)">
            <animate attributeName="r" values="9;8;9" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="74" cy="78" r="4" fill="hsl(220, 35%, 22%)" />
          {/* Blink */}
          <rect x="58" y="62" width="32" height="32" rx="16" fill="hsl(220, 35%, 22%)">
            <animate
              attributeName="height"
              values="0;0;0;0;0;0;0;32;0;0;0;0;0;0;0;0;32;0;0;0"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="78;78;78;78;78;78;78;62;78;78;78;78;78;78;78;78;62;78;78;78"
              dur="5s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Shine */}
          <circle cx="69" cy="72" r="4" fill="white" opacity="0.9" />
          <circle cx="79" cy="84" r="2" fill="white" opacity="0.5" />
        </g>

        {/* Right eye */}
        <g>
          <circle cx="126" cy="78" r="16" fill="white" />
          <circle cx="126" cy="78" r="9" fill="hsl(160, 60%, 45%)">
            <animate attributeName="r" values="9;8;9" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="126" cy="78" r="4" fill="hsl(220, 35%, 22%)" />
          {/* Blink */}
          <rect x="110" y="62" width="32" height="32" rx="16" fill="hsl(220, 35%, 22%)">
            <animate
              attributeName="height"
              values="0;0;0;0;0;0;0;32;0;0;0;0;0;0;0;0;32;0;0;0"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="78;78;78;78;78;78;78;62;78;78;78;78;78;78;78;78;62;78;78;78"
              dur="5s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Shine */}
          <circle cx="121" cy="72" r="4" fill="white" opacity="0.9" />
          <circle cx="131" cy="84" r="2" fill="white" opacity="0.5" />
        </g>

        {/* Mouth */}
        {isTalking ? (
          <g>
            <ellipse cx="100" cy="104" rx="14" ry="7" fill="hsl(0, 75%, 60%)">
              <animate attributeName="ry" values="7;3;9;4;7;10;5;7" dur="0.35s" repeatCount="indefinite" />
              <animate attributeName="rx" values="14;10;16;11;14;15;10;14" dur="0.35s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="100" cy="101" rx="8" ry="3" fill="hsl(0, 75%, 75%)" opacity="0.5">
              <animate attributeName="ry" values="3;1;4;2;3" dur="0.35s" repeatCount="indefinite" />
            </ellipse>
          </g>
        ) : (
          <path d="M85 100 Q100 114 115 100" stroke="hsl(160, 60%, 50%)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}

        {/* Cheek blush */}
        <circle cx="56" cy="98" r="8" fill="hsl(340, 80%, 75%)" opacity="0.35" />
        <circle cx="144" cy="98" r="8" fill="hsl(340, 80%, 75%)" opacity="0.35" />

        {/* Side ears/speakers */}
        <rect x="16" y="65" width="14" height="30" rx="7" fill="hsl(210, 80%, 48%)" />
        <rect x="170" y="65" width="14" height="30" rx="7" fill="hsl(210, 80%, 48%)" />
        <rect x="19" y="72" width="8" height="4" rx="2" fill="hsl(210, 80%, 65%)" />
        <rect x="19" y="80" width="8" height="4" rx="2" fill="hsl(210, 80%, 65%)" />
        <rect x="173" y="72" width="8" height="4" rx="2" fill="hsl(210, 80%, 65%)" />
        <rect x="173" y="80" width="8" height="4" rx="2" fill="hsl(210, 80%, 65%)" />

        {/* Body */}
        <rect x="55" y="148" width="90" height="38" rx="16" fill="hsl(210, 80%, 55%)" />
        <rect x="60" y="153" width="80" height="28" rx="12" fill="hsl(210, 85%, 62%)" />
        
        {/* Chest buttons */}
        <circle cx="85" cy="167" r="5" fill="hsl(0, 75%, 60%)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="167" r="5" fill="hsl(45, 95%, 60%)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="115" cy="167" r="5" fill="hsl(160, 60%, 45%)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Left arm — waving */}
        <motion.g
          animate={animate ? { rotate: [0, -20, 10, -20, 0] } : undefined}
          transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 } : undefined}
          style={{ transformOrigin: "55px 155px" }}
        >
          <rect x="28" y="152" width="30" height="12" rx="6" fill="hsl(210, 80%, 48%)" />
          <circle cx="27" cy="158" r="8" fill="hsl(210, 85%, 62%)" stroke="hsl(210, 80%, 48%)" strokeWidth="2" />
        </motion.g>

        {/* Right arm */}
        <rect x="142" y="152" width="30" height="12" rx="6" fill="hsl(210, 80%, 48%)" />
        <circle cx="173" cy="158" r="8" fill="hsl(210, 85%, 62%)" stroke="hsl(210, 80%, 48%)" strokeWidth="2" />

        {/* Feet */}
        <rect x="66" y="184" width="22" height="12" rx="6" fill="hsl(210, 80%, 48%)" />
        <rect x="112" y="184" width="22" height="12" rx="6" fill="hsl(210, 80%, 48%)" />
      </svg>
    </motion.div>
  );
};

export default RoboAvatar;