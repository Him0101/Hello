// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Clock, Languages, ArrowRight, Search } from "lucide-react";
// import { Input } from "@/components/ui/input";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// const LANG_NAMES = {
//   "en-IN": "English", "hi-IN": "Hindi", "mr-IN": "Marathi", "gu-IN": "Gujarati",
//   "bn-IN": "Bengali", "kn-IN": "Kannada", "ml-IN": "Malayalam", "ta-IN": "Tamil",
//   "te-IN": "Telugu", "pa-IN": "Punjabi", "od-IN": "Odia", "as-IN": "Assamese",
// };

// export default function TranslationHistory({ user }) {
//   const [history, setHistory] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) { setLoading(false); return; }
//     const fetchHistory = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/translations/history`, { credentials: "include" });
//         if (res.ok) setHistory(await res.json());
//       } catch {}
//       setLoading(false);
//     };
//     fetchHistory();
//   }, [user]);

//   const filtered = history.filter((h) =>
//     h.source_text?.toLowerCase().includes(search.toLowerCase()) ||
//     h.translated_text?.toLowerCase().includes(search.toLowerCase())
//   );

//   if (!user) {
//     return (
//       <div className="h-full flex items-center justify-center" data-testid="translation-history-page">
//         <p className="font-body text-sm text-zinc-400">Sign in to view your translation history</p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full overflow-y-auto" data-testid="translation-history-page">
//       <div className="max-w-4xl mx-auto px-5 md:px-10 py-6">
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">Translation History</h1>
//             <p className="font-body text-[11px] text-zinc-400 mt-0.5">{history.length} translations</p>
//           </div>
//           <div className="relative w-48">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
//             <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 rounded-full text-[12px] font-body h-8 border-zinc-200" />
//           </div>
//         </motion.div>

//         {loading ? (
//           <div className="flex justify-center py-16">
//             <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-16">
//             <Languages className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
//             <p className="font-body text-sm text-zinc-400">No translations yet</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {filtered.map((item, i) => (
//               <motion.div key={item.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
//                 className="p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
//                 <div className="flex items-center gap-2 mb-2">
//                   <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-saffron/10 text-saffron">{LANG_NAMES[item.source_language] || item.source_language}</span>
//                   <ArrowRight className="w-3 h-3 text-zinc-300" />
//                   <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium bg-india-green/10 text-india-green">{LANG_NAMES[item.target_language] || item.target_language}</span>
//                   <span className="ml-auto flex items-center gap-1 text-[10px] font-body text-zinc-300">
//                     <Clock className="w-3 h-3" />
//                     {new Date(item.timestamp).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <div className="grid md:grid-cols-2 gap-3">
//                   <p className="text-[12px] font-body text-zinc-600 bg-zinc-50 rounded-lg p-2.5">{item.source_text}</p>
//                   <p className="text-[12px] font-body text-zinc-700 bg-india-green/5 rounded-lg p-2.5 font-medium">{item.translated_text}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Languages, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const LANG_NAMES = {
  "en-IN": "English",
  "hi-IN": "Hindi",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "bn-IN": "Bengali",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "pa-IN": "Punjabi",
  "od-IN": "Odia",
  "as-IN": "Assamese",
};

export default function TranslationHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("👤 USER:", user);

    const fetchHistory = async () => {
      try {
        console.log("📡 CALLING HISTORY API...");

        const res = await fetch(`${BACKEND_URL}/api/translation/history`);

        if (!res.ok) {
          console.log("❌ API FAILED:", res.status);
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();

        console.log("📜 HISTORY DATA:", data);

        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("❌ HISTORY ERROR:", err);
        setHistory([]);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  const filtered = history.filter((h) => {
    const source = (h.source_text || "").toLowerCase();
    const translated = (h.translated_text || "").toLowerCase();

    return (
      source.includes(search.toLowerCase()) ||
      translated.includes(search.toLowerCase())
    );
  });

  return (
    <div className="h-full overflow-y-auto relative bg-gradient-to-br from-orange-50/70 via-white to-green-50/70">
      {/* SOFT WAVY BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-32 w-[520px] h-[520px] rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute top-24 -right-40 w-[560px] h-[560px] rounded-full bg-green-200/25 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-[50%] bg-blue-200/20 blur-3xl" />

        <svg
          className="absolute top-0 left-0 w-full h-48 opacity-40"
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

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 py-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Translation History
            </h1>
            <p className="text-[11px] text-zinc-500 mt-1">
              {history.length} translations
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 rounded-full text-[12px] h-8 bg-white/75 backdrop-blur border-blue-100 focus-visible:ring-blue-200"
            />
          </div>
        </motion.div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur rounded-2xl border border-white/70">
            <Languages className="w-8 h-8 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No translations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative overflow-hidden p-4 rounded-2xl border border-white/80 bg-white/75 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-400 via-white to-green-500" />
                <div className="absolute right-4 top-4 w-10 h-10 rounded-full border border-blue-200/60 opacity-30" />

                {/* LANG HEADER */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-700 border border-orange-100 rounded-full">
                    {LANG_NAMES[item.source_language] || item.source_language}
                  </span>

                  <ArrowRight className="w-3 h-3 text-blue-400" />

                  <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-700 border border-green-100 rounded-full">
                    {LANG_NAMES[item.target_language] || item.target_language}
                  </span>

                  <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-400">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString()
                      : "Now"}
                  </span>
                </div>

                {/* TEXT */}
                <div className="grid md:grid-cols-2 gap-3">
                  <p className="text-[12px] text-zinc-700 bg-white/80 p-2 rounded-xl border border-orange-50">
                    {item.source_text}
                  </p>

                  <p className="text-[12px] text-zinc-800 bg-green-50/70 p-2 rounded-xl border border-green-100 font-medium">
                    {item.translated_text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}