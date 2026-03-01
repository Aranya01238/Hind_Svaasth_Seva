import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, Activity, Radio } from "lucide-react";

interface SplashLoaderProps {
  children: React.ReactNode;
}

const LOAD_DURATION_MS = 4000;
const PROGRESS_INTERVAL_MS = 40;

export default function HssTacticalLoader({ children }: SplashLoaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(
        100,
        Math.round((elapsed / LOAD_DURATION_MS) * 100),
      );
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => setLoading(false), 500);
      }
    };

    const progressInterval = setInterval(updateProgress, PROGRESS_INTERVAL_MS);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#06080a] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            {/* Background Tactical Grid - Connected to Main Page Design */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Pulsing Radar Rings */}
            <div className="relative flex items-center justify-center">
              {[1, 1.5, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-blue-500/20"
                  style={{ width: 150 * i, height: 150 * i }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.3, 0.1],
                    borderWidth: ["1px", "2px", "1px"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}

              {/* Core HSS Emblem */}
              <motion.div
                className="relative z-10 flex h-32 w-32 items-center justify-center rounded-3xl bg-[#0d1117] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                animate={{
                  boxShadow: [
                    "0_0_20px_rgba(59,130,246,0.2)",
                    "0_0_50px_rgba(59,130,246,0.4)",
                    "0_0_20px_rgba(59,130,246,0.2)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex flex-col items-center">
                  <Heart className="h-10 w-10 text-blue-500 fill-blue-500 mb-1" />
                  <span className="text-xl font-black text-white tracking-tighter">
                    HSS
                  </span>
                </div>

                {/* Rotating External Scan Ring */}
                <motion.div
                  className="absolute -inset-4 rounded-[2.5rem] border-2 border-transparent border-t-blue-500 border-l-blue-500/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            {/* Loading Status Text */}
            <div className="mt-16 flex w-full max-w-xs flex-col items-center">
              <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">
                <Radio className="h-3 w-3 animate-pulse" />
                Initializing Tactical Grid
              </div>

              {/* Precise Surgical Progress Bar */}
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between w-full font-mono text-[10px] uppercase tracking-widest">
                <span className="text-slate-500">Status: Secure</span>
                <span className="text-blue-500">{progress}% Encrypted</span>
              </div>
            </div>

            {/* Tactical Metadata - Connection to India Health Grid */}
            <div className="absolute bottom-10 flex gap-8">
              <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                <Shield className="h-3 w-3" /> Secure Node
              </div>
              <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                <Activity className="h-3 w-3" /> Bio-Link Active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {children}
      </motion.div>
    </>
  );
}
