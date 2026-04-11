import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Copy, Check, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "bn-IN", label: "Bengali" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
];

export default function SpeechToTextPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState("hi-IN");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome or Edge."); return; }
    const r = new SR();
    r.lang = language;
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      if (final) setTranscript((p) => p + final);
      setInterimText(interim);
    };
    r.onend = () => { setIsListening(false); setInterimText(""); };
    r.onerror = () => { setIsListening(false); setInterimText(""); };
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); setInterimText(""); };

  return (
    <div className="h-full overflow-y-auto" data-testid="speech-to-text-page">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">Speech to Text</h1>
            <p className="font-body text-[11px] text-zinc-400 mt-0.5">Transcribe speech and get transcripts</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 object-contain" />
            <span className="font-heading text-[13px] font-semibold text-zinc-900">Sarvbhasa</span>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <label className="text-[10px] font-body font-semibold text-india-green uppercase tracking-wider mb-1 block">Recognition Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px] rounded-lg border-zinc-200 bg-zinc-50 font-body text-[13px]" data-testid="speech-language-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </motion.div>

        {/* Mic */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {isListening && <div className="absolute inset-0 rounded-full animate-ping bg-red-200 opacity-40" />}
            <button data-testid="speech-mic-btn" onClick={isListening ? stopListening : startListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200" : "bg-gradient-to-br from-saffron to-india-green hover:opacity-90 shadow-lg"
              }`}>
              {isListening ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7 text-white" />}
            </button>
          </div>
          <p className="font-body text-[13px] font-medium text-zinc-500">
            {isListening ? (
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Listening... Click to stop</span>
            ) : "Start Speaking"}
          </p>
        </motion.div>

        {/* Transcript */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading text-[13px] font-semibold text-zinc-900">Transcript</h2>
            <div className="flex gap-1">
              <button onClick={() => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                disabled={!transcript} className="p-1 rounded hover:bg-zinc-100 transition-colors disabled:opacity-30" data-testid="speech-copy-btn">
                {copied ? <Check className="w-3.5 h-3.5 text-india-green" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
              <button onClick={() => { setTranscript(""); setInterimText(""); }} disabled={!transcript}
                className="p-1 rounded hover:bg-zinc-100 transition-colors disabled:opacity-30" data-testid="speech-clear-btn">
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
          <div className="min-h-[180px] rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-body text-[13px] text-zinc-700 leading-relaxed" data-testid="speech-transcript-area">
            {transcript || interimText ? (
              <>{transcript}{interimText && <span className="text-zinc-400 italic">{interimText}</span>}</>
            ) : (
              <span className="text-zinc-300">Your transcript will appear here...</span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
