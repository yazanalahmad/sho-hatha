import { AnimatePresence, motion } from 'framer-motion';

interface TurnBannerProps {
  open: boolean;
  teamName: string;
  teamColor: string;
}

export function TurnBanner({ open, teamName, teamColor }: TurnBannerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, color-mix(in srgb, ${teamColor} 30%, var(--bg-base) 70%) 0%, var(--bg-base) 65%)`,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-72 w-72 rounded-full"
            style={{ boxShadow: `0 0 80px 20px ${teamColor}`, opacity: 0.3 }}
          />
          <div className="relative z-10 text-center">
            <h1 className="text-[clamp(4rem,10vw,7rem)] text-ivory">🔥 {teamName} 🔥</h1>
            <p className="text-2xl tracking-[0.3em]" style={{ color: teamColor }}>
              YOUR TURN
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
