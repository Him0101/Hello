import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Copy, Check, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const LANGUAGES = [
  { code: "en-IN", label: "English" }, { code: "hi-IN", label: "Hindi" }, { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" }, { code: "bn-IN", label: "Bengali" }, { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" }, { code: "ta-IN", label: "Tamil" }, { code: "te-IN", label: "Telugu" },
  { code: "pa-IN", label: "Punjabi" }, { code: "od-IN", label: "Odia" },
];

export default function TextTranslatePage() {
  const [sourceLang, setSourceLang] = useState("en-IN");
  const [targetLang, setTargetLang] = useState("hi-IN");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true); setTranslatedText("");
    try {
      const r = await fetch(`${BACKEND_URL}/api/translate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ text: sourceText, source_language: sourceLang, target_language: targetLang }),
      });
      const d = await r.json();
      setTranslatedText(d.translated_text || d.translated || "Translation failed");
    } catch { setTranslatedText("Network error. Try again."); }
    setIsTranslating(false);
  };

  const handleSwap = () => { setSourceLang(targetLang); setTargetLang(sourceLang); setSourceText(translatedText); setTranslatedText(sourceText); };
  const handleCopy = () => { if (translatedText) { navigator.clipboard.writeText(translatedText); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const handleSpeak = (text, lang) => { if (!text) return; const u = new SpeechSynthesisUtterance(text); u.lang = lang; speechSynthesis.speak(u); };

  return (
    <div className="h-full overflow-y-auto wavy-tricolor-bg" data-testid="text-translate-page">
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">Text Translate</h1>
            <p className="font-body text-[11px] text-zinc-400 mt-0.5">Translate between Indian languages using Sarvam AI</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 object-contain" />
            <span className="font-heading text-[13px] font-semibold text-zinc-900">Sarvbhasa</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <label className="text-[10px] font-body font-semibold text-saffron uppercase tracking-wider mb-1 block">A — Source</label>
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-full rounded-lg border-zinc-200 bg-white/80 backdrop-blur-sm font-body text-[13px]" data-testid="translate-source-lang"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <button data-testid="translate-swap-btn" onClick={handleSwap} className="mt-5 p-2 rounded-full border border-saffron/30 hover:bg-saffron/5 transition-colors bg-white/60">
            <ArrowLeftRight className="w-4 h-4 text-saffron" />
          </button>
          <div className="flex-1">
            <label className="text-[10px] font-body font-semibold text-india-green uppercase tracking-wider mb-1 block">B — Target</label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full rounded-lg border-zinc-200 bg-white/80 backdrop-blur-sm font-body text-[13px]" data-testid="translate-target-lang"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-saffron to-saffron/30" />
            <Textarea data-testid="translate-source-text" value={sourceText} onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..." className="min-h-[220px] md:min-h-[300px] rounded-xl border-zinc-200 bg-white/80 backdrop-blur-sm font-body text-[13px] resize-none p-4 pt-5" />
            <div className="absolute bottom-2.5 right-3 flex gap-1">
              <button onClick={() => handleSpeak(sourceText, sourceLang)} className="p-1 rounded hover:bg-zinc-200 transition-colors" data-testid="translate-source-speak-btn"><Volume2 className="w-3.5 h-3.5 text-zinc-400" /></button>
            </div>
            <p className="text-[10px] font-body text-zinc-300 mt-1 text-right">{sourceText.length} chars</p>
          </div>
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-india-green/30 to-india-green" />
            <Textarea data-testid="translate-output-text" value={isTranslating ? "" : translatedText} readOnly
              placeholder="Translation will appear here..." className="min-h-[220px] md:min-h-[300px] rounded-xl border-zinc-200 bg-white/90 font-body text-[13px] resize-none p-4 pt-5" />
            {isTranslating && <div className="absolute inset-0 flex items-center justify-center rounded-xl"><Loader2 className="w-6 h-6 text-india-green animate-spin" /></div>}
            <div className="absolute bottom-2.5 right-3 flex gap-1">
              <button onClick={handleCopy} disabled={!translatedText} className="p-1 rounded hover:bg-zinc-100 transition-colors disabled:opacity-30" data-testid="translate-copy-btn">
                {copied ? <Check className="w-3.5 h-3.5 text-india-green" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
              <button onClick={() => handleSpeak(translatedText, targetLang)} className="p-1 rounded hover:bg-zinc-100 transition-colors" data-testid="translate-target-speak-btn"><Volume2 className="w-3.5 h-3.5 text-zinc-400" /></button>
            </div>
            <p className="text-[10px] font-body text-zinc-300 mt-1 text-right">{translatedText.length} chars</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
          <Button data-testid="translate-submit-btn" onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} size="lg"
            className="rounded-full px-10 py-5 bg-gradient-to-r from-saffron to-india-green hover:opacity-90 text-white font-body text-[13px] font-medium disabled:opacity-30 transition-opacity">
            {isTranslating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Translating...</> : "Translate"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
