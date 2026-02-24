import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
}

const COLORS = [
  "hsl(45, 95%, 60%)",   // accent gold
  "hsl(210, 80%, 55%)",  // primary blue
  "hsl(160, 60%, 45%)",  // secondary green
  "hsl(340, 80%, 55%)",  // pink
  "hsl(280, 70%, 60%)",  // purple
  "hsl(20, 90%, 55%)",   // orange
];

function generateParticles(burstCount: number): FireworkParticle[] {
  const particles: FireworkParticle[] = [];
  let id = 0;

  for (let b = 0; b < burstCount; b++) {
    const cx = 20 + Math.random() * 60; // % from left
    const cy = 15 + Math.random() * 40; // % from top
    const count = 10 + Math.floor(Math.random() * 8);
    const burstDelay = b * 0.35;

    for (let i = 0; i < count; i++) {
      particles.push({
        id: id++,
        x: cx,
        y: cy,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        angle: (360 / count) * i + (Math.random() - 0.5) * 20,
        distance: 60 + Math.random() * 100,
        delay: burstDelay + Math.random() * 0.15,
      });
    }
  }
  return particles;
}

interface FireworksOverlayProps {
  show: boolean;
}

const FireworksOverlay = ({ show }: FireworksOverlayProps) => {
  const [particles, setParticles] = useState<FireworkParticle[]>([]);

  useEffect(() => {
    if (show) {
      setParticles(generateParticles(5));
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
        >
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const dx = Math.cos(rad) * p.distance;
            const dy = Math.sin(rad) * p.distance;

            return (
              <motion.div
                key={p.id}
                initial={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: [0, dx * 0.6, dx],
                  y: [0, dy * 0.6 - 20, dy + 30],
                  scale: [0, 1.3, 0],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.4,
                  delay: p.delay,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
              />
            );
          })}

          {/* Sparkle trails */}
          {particles
            .filter((_, i) => i % 3 === 0)
            .map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const dx = Math.cos(rad) * p.distance * 0.5;
              const dy = Math.sin(rad) * p.distance * 0.5;
              return (
                <motion.div
                  key={`trail-${p.id}`}
                  initial={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    scale: 0,
                    opacity: 0.8,
                  }}
                  animate={{
                    x: [0, dx],
                    y: [0, dy],
                    scale: [0, 0.6, 0],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: p.delay + 0.1,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    backgroundColor: "white",
                  }}
                />
              );
            })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FireworksOverlay;
