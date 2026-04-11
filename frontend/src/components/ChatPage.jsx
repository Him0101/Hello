import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/127956fb27e12c22f854fdbc7acf424e2c0efffa35955b88dfdf5f362c6b9bef.png";
const USER_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/a1ea70de2b472683ad014fef727a326d27f6d885387992f1b26df4b90a7e06be.png";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "bn-IN", label: "Bengali" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "pa-IN", label: "Punjabi" },
];

const LANG_IMAGES = {
  "en-IN": "https://images.unsplash.com/photo-1723564211725-97aa919fc0eb?w=800&q=50",
  "hi-IN": "https://images.unsplash.com/photo-1589651375281-c3e9308ae434?w=800&q=50",
  "mr-IN": "https://images.unsplash.com/photo-1682830819658-841ec2e66bf4?w=800&q=50",
  "gu-IN": "https://images.unsplash.com/photo-1475608895924-884f5fcbf109?w=800&q=50",
  "bn-IN": "https://images.unsplash.com/photo-1760344654401-43c9fac457ff?w=800&q=50",
  "kn-IN": "https://images.unsplash.com/photo-1708590856768-61f5a9cae9a2?w=800&q=50",
  "ml-IN": "https://images.unsplash.com/photo-1771575520248-d1b6dc106326?w=800&q=50",
  "ta-IN": "https://images.unsplash.com/photo-1708590856768-61f5a9cae9a2?w=800&q=50",
  "te-IN": "https://images.unsplash.com/photo-1723564211725-97aa919fc0eb?w=800&q=50",
  "pa-IN": "https://images.unsplash.com/photo-1682830819658-841ec2e66bf4?w=800&q=50",
};

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", content: "Welcome to Sarvbhasa! Select source and target languages, type a message, and I'll translate it for you in real-time using Sarvam Maurya API." },
  ]);
  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState("en-IN");
  const [targetLang, setTargetLang] = useState("hi-IN");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language: sourceLang, target_language: targetLang }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please try again." }]);
    }
    setIsTyping(false);
  };

  const toggleMic = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome or Edge."); return; }
    const r = new SR();
    r.lang = sourceLang;
    r.interimResults = true;
    r.onresult = (e) => { setInput(Array.from(e.results).map((x) => x[0].transcript).join("")); };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const bgImage = LANG_IMAGES[targetLang] || LANG_IMAGES["en-IN"];

  return (
    <div className="flex flex-col h-full relative" data-testid="chat-page">
      {/* Language background image */}
      <img src={bgImage} alt="" className="lang-bg-image" />

      {/* Header */}
      <div className="relative z-10 border-b border-zinc-100 bg-white/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-bold tracking-tight text-zinc-900">Multilingual AI Chatbot</h1>
          <p className="font-body text-[11px] text-zinc-400">Powered by Sarvam Maurya API</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-india-green animate-pulse" />
          <span className="text-[11px] font-body text-zinc-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <img src={msg.role === "assistant" ? AI_AVATAR : USER_AVATAR} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-[13px] font-body leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-br from-saffron to-saffron/80 text-white rounded-tr-sm shadow-sm"
                : "bg-white/90 text-zinc-700 border border-zinc-100 rounded-tl-sm shadow-sm backdrop-blur-sm"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5">
            <img src={AI_AVATAR} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className="bg-white/90 border border-zinc-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-saffron/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="relative z-10 border-t border-zinc-100 bg-white/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="w-[100px] rounded-full border-zinc-200 bg-zinc-50 text-[11px] font-body h-9" data-testid="chat-source-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code} className="text-[12px]">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <span className="text-zinc-300 text-[10px]">→</span>

          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-[100px] rounded-full border-zinc-200 bg-zinc-50 text-[11px] font-body h-9" data-testid="chat-target-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code} className="text-[12px]">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            data-testid="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Send a message..."
            className="flex-1 rounded-full border-zinc-200 bg-zinc-50 px-4 h-9 font-body text-[13px]"
          />

          <Button data-testid="chat-mic-btn" onClick={toggleMic} variant="outline" size="icon"
            className={`rounded-full h-9 w-9 flex-shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600 border-red-500 text-white" : "border-zinc-200"}`}>
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-zinc-500" />}
          </Button>

          <Button data-testid="chatbot-submit-btn" onClick={handleSend} disabled={!input.trim()}
            className="rounded-full h-9 px-4 bg-india-green hover:bg-india-green/90 text-white font-body text-[12px] font-medium disabled:opacity-30 gap-1.5">
            <Send className="w-3.5 h-3.5" /> Translate
          </Button>
        </div>
      </div>
    </div>
  );
}
