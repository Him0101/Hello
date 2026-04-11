import { Languages, MessageSquare, Mic, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const FEATURES = [
  {
    id: "chat",
    icon: MessageSquare,
    title: "Multilingual AI Chatbot",
    desc: "Chat with AI in any Indian language",
    color: "text-saffron",
    bg: "bg-saffron/10",
  },
  {
    id: "translate",
    icon: Languages,
    title: "Text to Text Translate",
    desc: "Translate between Indian languages instantly",
    color: "text-india-green",
    bg: "bg-india-green/10",
  },
  {
    id: "speech",
    icon: Mic,
    title: "Speech to Text",
    desc: "Transcribe speech and get transcripts",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="h-full overflow-y-auto" data-testid="home-page">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <img src={LOGO_URL} alt="Sarvbhasa" className="h-16 w-16 mx-auto mb-6 object-contain" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
            Multilingual AI Chatbot
          </h1>
          <p className="mt-3 font-body text-base text-zinc-500">
            भाषा बदले, मतलब नहीं — Language Changes, Meaning Doesn't.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
                data-testid={`home-${feature.id}-card`}
                onClick={() => onNavigate(feature.id)}
                className="text-left p-6 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-heading text-base font-semibold text-zinc-900 mb-1">{feature.title}</h3>
                <p className="font-body text-sm text-zinc-500 mb-4">{feature.desc}</p>
                <div className="flex items-center gap-1 text-sm font-body font-medium text-zinc-400 group-hover:text-zinc-700 transition-colors">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
