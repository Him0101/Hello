import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Copy, Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
];

export default function TextTranslatePage() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setTranslatedText("");

    try {
      const res = await fetch(`${API}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          source_language: sourceLang,
          target_language: targetLang,
        }),
      });
      const data = await res.json();
      setTranslatedText(data.translated_text);
    } catch {
      setTranslatedText("Translation failed. Please try again.");
    }
    setIsTranslating(false);
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = (text, lang) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-IN" : lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : lang === "gu" ? "gu-IN" : lang === "bn" ? "bn-IN" : lang === "kn" ? "kn-IN" : "ml-IN";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full overflow-y-auto" data-testid="text-translate-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">
              Text Translate
            </h1>
            <p className="font-body text-sm text-zinc-400 mt-1">Translate between Indian languages</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-semibold text-zinc-900">Sarvbhasa</span>
          </div>
        </motion.div>

        {/* Language Selectors */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex-1">
            <label className="text-xs font-body font-medium text-zinc-400 uppercase tracking-wider mb-1.5 block">
              A — Source Language
            </label>
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-full rounded-lg border-zinc-200 bg-zinc-50 font-body" data-testid="translate-source-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            data-testid="translate-swap-btn"
            onClick={handleSwapLanguages}
            className="mt-5 p-2 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-zinc-500" />
          </button>

          <div className="flex-1">
            <label className="text-xs font-body font-medium text-zinc-400 uppercase tracking-wider mb-1.5 block">
              B — Target Language
            </label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full rounded-lg border-zinc-200 bg-zinc-50 font-body" data-testid="translate-target-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Text Areas */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mb-6"
        >
          {/* Source */}
          <div className="relative">
            <Textarea
              data-testid="translate-source-text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[200px] md:min-h-[280px] rounded-xl border-zinc-200 bg-zinc-50 font-body text-sm resize-none p-4"
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <button
                onClick={() => handleSpeak(sourceText, sourceLang)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                data-testid="translate-source-speak-btn"
                title="Listen"
              >
                <Volume2 className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-[11px] font-body text-zinc-300 mt-1 text-right">
              {sourceText.length} characters
            </p>
          </div>

          {/* Target */}
          <div className="relative">
            <Textarea
              data-testid="translate-output-text"
              value={isTranslating ? "Translating..." : translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className="min-h-[200px] md:min-h-[280px] rounded-xl border-zinc-200 bg-white font-body text-sm resize-none p-4"
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                data-testid="translate-copy-btn"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-india-green" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
              <button
                onClick={() => handleSpeak(translatedText, targetLang)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                data-testid="translate-target-speak-btn"
                title="Listen"
              >
                <Volume2 className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-[11px] font-body text-zinc-300 mt-1 text-right">
              {translatedText.length} characters
            </p>
          </div>
        </motion.div>

        {/* Translate Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            data-testid="translate-submit-btn"
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            size="lg"
            className="rounded-full px-10 py-6 bg-zinc-900 hover:bg-zinc-700 text-white font-body text-sm font-medium disabled:opacity-30 transition-colors"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
