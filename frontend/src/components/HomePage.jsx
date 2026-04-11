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
    <div className="h-full overflow-y-auto tricolor-gradient" data-testid="home-page">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-12">
          <img src={LOGO_URL} alt="Sarvbhasa" className="h-14 w-14 mx-auto mb-4 object-contain" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
            Multilingual AI Chatbot
          </h1>
          <p className="mt-2 font-heading text-lg font-semibold text-saffron">भाषा बदले, मतलब नहीं</p>
          <p className="font-body text-sm text-zinc-400">Language Changes, Meaning Doesn't.</p>
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
                className={`text-left p-5 rounded-xl border border-zinc-100 ${colors.border} hover:shadow-md transition-all group`}
              >
                <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                </div>
                <h3 className="font-heading text-sm font-semibold text-zinc-900 mb-1">{f.title}</h3>
                <p className="font-body text-xs text-zinc-500 mb-3 leading-relaxed">{f.desc}</p>
                <span className="flex items-center gap-1 text-xs font-body font-medium text-zinc-400 group-hover:text-zinc-700 transition-colors">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Languages showcase */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-india-green" />
            <p className="font-heading text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">Supported Languages</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_SHOWCASE.map((lang) => (
              <span key={lang} className="px-3 py-1 rounded-full text-[11px] font-body font-medium bg-zinc-50 text-zinc-600 border border-zinc-100">
                {lang}
              </span>
            ))}
          </div>
          <p className="font-body text-[10px] text-zinc-300 mt-3">Powered by Sarvam Maurya API — 22+ Indian Languages</p>
        </motion.div>
      </div>
    </div>
  );
}
