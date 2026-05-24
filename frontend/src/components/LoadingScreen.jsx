import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

export default function LoadingScreen() {
  return (
    <motion.div
      data-testid="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 overflow-hidden"
    >
      {/* 🌊 Soft background waves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-32 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/20 rounded-full blur-3xl" />

        <svg
          className="absolute top-0 left-0 w-full h-40 opacity-40"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96 C240,160 480,20 720,96 C960,172 1200,52 1440,112 L1440,0 L0,0 Z"
            fill="rgba(255,153,51,0.25)"
          />
          <path
            d="M0,150 C260,90 520,190 760,135 C1000,80 1220,145 1440,95 L1440,0 L0,0 Z"
            fill="rgba(19,136,8,0.15)"
          />
        </svg>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo box with tricolor border */}
        <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border border-white/80">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-orange-400 via-white to-green-500 opacity-40" />
          <img
            src={LOGO_URL}
            alt="Sarvbhasa"
            className="w-16 h-16 object-contain relative z-10"
          />
        </div>

        {/* Brand text */}
        <h2 className="font-heading text-2xl font-bold tracking-tighter text-zinc-900">
          SARVBHASA
        </h2>

        {/* Loading arrows */}
        <div className="flex items-center gap-1 mt-2">
          <div className="animate-pulse-arrow">
            <ArrowRight className="w-5 h-5 text-orange-500" />
          </div>
          <div className="animate-pulse-arrow" style={{ animationDelay: "0.2s" }}>
            <ArrowRight className="w-5 h-5 text-blue-500" />
          </div>
          <div className="animate-pulse-arrow" style={{ animationDelay: "0.4s" }}>
            <ArrowRight className="w-5 h-5 text-green-500" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-white/60 backdrop-blur rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}