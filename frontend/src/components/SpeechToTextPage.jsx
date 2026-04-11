import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Square, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimText(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimText("");
  };

  return (
    <div className="h-full overflow-y-auto" data-testid="speech-to-text-page">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">
              Speech to Text
            </h1>
            <p className="font-body text-sm text-zinc-400 mt-1">Transcribe speech and get transcripts</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-semibold text-zinc-900">Sarvbhasa</span>
          </div>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <label className="text-xs font-body font-medium text-zinc-400 uppercase tracking-wider mb-1.5 block">
            Recognition Language
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[200px] rounded-lg border-zinc-200 bg-zinc-50 font-body" data-testid="speech-language-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Mic Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative mb-6">
            {isListening && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-200 opacity-40" />
            )}
            <button
              data-testid="speech-mic-btn"
              onClick={isListening ? stopListening : startListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                  : "bg-zinc-900 hover:bg-zinc-700 shadow-lg shadow-zinc-200"
              }`}
            >
              {isListening ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>
          </div>

          <p className="font-body text-sm font-medium text-zinc-600">
            {isListening ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Listening... Click to stop
              </span>
            ) : (
              "Start Speaking"
            )}
          </p>
        </motion.div>

        {/* Transcript Area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-zinc-900">Transcript</h2>
            <div className="flex gap-1">
              <button
                onClick={handleCopy}
                disabled={!transcript}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"
                data-testid="speech-copy-btn"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-india-green" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
              <button
                onClick={handleClear}
                disabled={!transcript}
                className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"
                data-testid="speech-clear-btn"
                title="Clear"
              >
                <Trash2 className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          <div
            className="min-h-[200px] rounded-xl border border-zinc-200 bg-zinc-50 p-5 font-body text-sm text-zinc-700 leading-relaxed"
            data-testid="speech-transcript-area"
          >
            {transcript || interimText ? (
              <>
                {transcript}
                {interimText && (
                  <span className="text-zinc-400 italic">{interimText}</span>
                )}
              </>
            ) : (
              <span className="text-zinc-300">Your transcript will appear here...</span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
