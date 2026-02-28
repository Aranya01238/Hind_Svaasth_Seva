import { motion } from "framer-motion";

const ERLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg width="200" height="80" viewBox="0 0 200 80" className="overflow-visible">
          <path
            d="M0,40 L30,40 L40,40 L50,15 L60,65 L70,25 L80,55 L90,40 L120,40 L200,40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            className="animate-ecg"
          />
        </svg>
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground text-sm font-body tracking-wide"
      >
        Loading Hind Svaasth Seva...
      </motion.p>
    </div>
  );
};

export default ERLoader;
