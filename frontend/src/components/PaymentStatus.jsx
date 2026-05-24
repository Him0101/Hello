import { Languages, MessageSquare, Mic, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const FEATURES = [
  { id: "chat", icon: MessageSquare, title: "Multilingual AI Chatbot", desc: "Chat and translate in real-time across Indian languages", accent: "saffron" },
  { id: "translate", icon: Languages, title: "Text to Text Translate", desc: "Translate text between 22+ Indian languages using Sarvam AI", accent: "green" },
  { id: "speech", icon: Mic, title: "Speech to Text", desc: "Record your voice and get instant transcripts", accent: "blue" },
];

const LANGUAGES_SHOWCASE = ["Hindi", "Marathi", "Gujarati", "Bengali", "Kannada", "Malayalam", "Punjabi", "Tamil", "Telugu"];

export default function HomePage({ onNavigate }) {
  return (
    <div
      className="h-full overflow-y-auto relative bg-gradient-to-br from-orange-50/70 via-white to-green-50/70"
      data-testid="home-page"
    >
      {/* Soft wavy tricolor background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute top-28 -right-40 w-[560px] h-[560px] rounded-full bg-green-200/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-[50%] bg-blue-200/20 blur-3xl" />

        <svg
          className="absolute top-0 left-0 w-full h-52 opacity-40"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96 C240,160 480,20 720,96 C960,172 1200,52 1440,112 L1440,0 L0,0 Z"
            fill="rgba(255,153,51,0.22)"
          />
          <path
            d="M0,150 C260,90 520,190 760,135 C1000,80 1220,145 1440,95 L1440,0 L0,0 Z"
            fill="rgba(19,136,8,0.12)"
          />
          <path
            d="M0,118 C280,150 540,75 800,110 C1040,142 1260,105 1440,128"
            fill="none"
            stroke="rgba(0,0,128,0.18)"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="h-20 w-20 mx-auto mb-4 rounded-3xl bg-white/75 backdrop-blur-xl shadow-sm border border-white/80 flex items-center justify-center">
            <img src={LOGO_URL} alt="Sarvbhasa" className="h-14 w-14 object-contain" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
            Multilingual AI Chatbot
          </h1>

          <p className="mt-2 font-heading text-lg font-semibold text-saffron">
            भाषा बदले, मतलब नहीं
          </p>

          <p className="font-body text-sm text-zinc-500">
            Language Changes, Meaning Doesn't.
          </p>

          <div className="mt-5 mx-auto h-1 w-36 rounded-full bg-gradient-to-r from-orange-400 via-blue-400 to-green-500" />
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const colors = {
              saffron: { bg: "bg-saffron/10", text: "text-saffron", border: "hover:border-saffron/30" },
              green: { bg: "bg-india-green/10", text: "text-india-green", border: "hover:border-india-green/30" },
              blue: { bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-200" },
            }[f.accent];

            return (
              <motion.button
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                data-testid={`home-${f.id}-card`}
                onClick={() => onNavigate(f.id)}
                className={`relative overflow-hidden text-left p-5 rounded-2xl border border-white/80 bg-white/75 backdrop-blur-xl ${colors.border} hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 via-white to-green-500" />

                <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                </div>

                <h3 className="font-heading text-sm font-semibold text-zinc-900 mb-1">
                  {f.title}
                </h3>

                <p className="font-body text-xs text-zinc-500 mb-3 leading-relaxed">
                  {f.desc}
                </p>

                <span className="flex items-center gap-1 text-xs font-body font-medium text-zinc-400 group-hover:text-zinc-700 transition-colors">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Languages showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 px-5 py-6 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-india-green" />
            <p className="font-heading text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
              Supported Languages
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_SHOWCASE.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 rounded-full text-[11px] font-body font-medium bg-white/80 text-zinc-600 border border-zinc-100 hover:border-blue-100 hover:text-blue-600 transition-colors"
              >
                {lang}
              </span>
            ))}
          </div>

          <p className="font-body text-[10px] text-zinc-400 mt-3">
            Powered by Sarvam Maurya API — 22+ Indian Languages
          </p>
        </motion.div>
      </div>
    </div>
  );
}