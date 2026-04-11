import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Languages, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LANG_NAMES = {
  "en-IN": "English", "hi-IN": "Hindi", "mr-IN": "Marathi", "gu-IN": "Gujarati",
  "bn-IN": "Bengali", "kn-IN": "Kannada", "ml-IN": "Malayalam", "ta-IN": "Tamil",
  "te-IN": "Telugu", "pa-IN": "Punjabi", "od-IN": "Odia", "as-IN": "Assamese",
};

export default function TranslationHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/translations/history`, { credentials: "include" });
        if (res.ok) setHistory(await res.json());
      } catch {}
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  const filtered = history.filter((h) =>
    h.source_text?.toLowerCase().includes(search.toLowerCase()) ||
    h.translated_text?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center" data-testid="translation-history-page">
        <p className="font-body text-sm text-zinc-400">Sign in to view your translation history</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" data-testid="translation-history-page">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">Translation History</h1>
            <p className="font-body text-[11px] text-zinc-400 mt-0.5">{history.length} translations</p>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 rounded-full text-[12px] font-body h-8 border-zinc-200" />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Languages className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
            <p className="font-body text-sm text-zinc-400">No translations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <motion.div key={item.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-saffron/10 text-saffron">{LANG_NAMES[item.source_language] || item.source_language}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-300" />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-india-green/10 text-india-green">{LANG_NAMES[item.target_language] || item.target_language}</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-body text-zinc-300">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <p className="text-[12px] font-body text-zinc-600 bg-zinc-50 rounded-lg p-2.5">{item.source_text}</p>
                  <p className="text-[12px] font-body text-zinc-700 bg-india-green/5 rounded-lg p-2.5 font-medium">{item.translated_text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
