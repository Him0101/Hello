import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/564409bb8e808faf7fd3c28ce467777afa252beea13cd2094b46a1441d665ab7.png";

export default function HeroSection({ onExperience }) {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
      {/* Background image with tricolor hint */}
      <img
        src={HERO_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10"
        aria-hidden="true"
      />

      {/* Subtle tricolor accents */}
      <div
        className="absolute top-0 left-0 w-[40vw] h-[40vh] rounded-full -z-10"
        style={{
          background: "radial-gradient(circle at 20% 30%, rgba(255,153,51,0.08), transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full -z-10"
        style={{
          background: "radial-gradient(circle at 80% 70%, rgba(19,136,8,0.07), transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 mb-6"
        >
          Built on Sovereign Compute
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-900 leading-[1.05]"
        >
          India's Sovereign
          <br />
          <span className="relative">
            AI Platform
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8C50 3 100 2 150 4C200 6 250 3 298 8"
                stroke="#FF9933"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 font-body text-base md:text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed"
        >
          AI that speaks every language
        </motion.p>

        {/* Hindi Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4"
        >
          <p className="font-heading text-lg md:text-xl font-semibold text-saffron tracking-tight">
            भाषा बदले, मतलब नहीं.
          </p>
          <p className="font-body text-sm text-zinc-400 mt-1">
            Language Changes, Meaning Doesn't.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Button
            data-testid="hero-cta-btn"
            onClick={onExperience}
            size="lg"
            className="bg-zinc-900 text-white hover:bg-zinc-700 rounded-full px-8 py-6 text-base font-body font-medium gap-2 transition-all duration-200 hover:gap-3"
          >
            Experience Sarvbhasa
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Bottom tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-20 flex items-center justify-center gap-3"
        >
          <div className="h-px w-8 bg-zinc-200" />
          <p className="font-heading text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-300">
            India Builds with Sarvbhasa
          </p>
          <div className="h-px w-8 bg-zinc-200" />
        </motion.div>
      </div>
    </section>
  );
}
