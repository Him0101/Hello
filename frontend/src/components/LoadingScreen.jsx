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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
    >
      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Square logo frame */}
        <div className="w-24 h-24 rounded-2xl border-2 border-zinc-100 bg-white shadow-sm flex items-center justify-center overflow-hidden">
          <img
            src={LOGO_URL}
            alt="Sarvbhasa"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Brand text */}
        <h2 className="font-heading text-2xl font-bold tracking-tighter text-zinc-900">
          SARVBHASA
        </h2>

        {/* Loading arrow */}
        <div className="flex items-center gap-1 mt-2">
          <div className="animate-pulse-arrow">
            <ArrowRight className="w-5 h-5 text-saffron" />
          </div>
          <div className="animate-pulse-arrow" style={{ animationDelay: "0.2s" }}>
            <ArrowRight className="w-5 h-5 text-saffron/60" />
          </div>
          <div className="animate-pulse-arrow" style={{ animationDelay: "0.4s" }}>
            <ArrowRight className="w-5 h-5 text-saffron/30" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #FF9933, #138808)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
