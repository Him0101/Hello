import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/127956fb27e12c22f854fdbc7acf424e2c0efffa35955b88dfdf5f362c6b9bef.png";
const USER_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/a1ea70de2b472683ad014fef727a326d27f6d885387992f1b26df4b90a7e06be.png";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Sarvbhasa! I'm your multilingual AI assistant. Select a language and start chatting. Ask me anything about Indian language translation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : language === "gu" ? "gu-IN" : language === "bn" ? "bn-IN" : language === "kn" ? "kn-IN" : "ml-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="flex flex-col h-full" data-testid="chat-page">
      {/* Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">
          Multilingual AI Chatbot
        </h1>
        <p className="font-body text-sm text-zinc-400">Powered by Sarvam Maurya API</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" ref={scrollRef}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <img
              src={msg.role === "assistant" ? AI_AVATAR : USER_AVATAR}
              alt={msg.role}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
            />
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-900 text-white rounded-tr-sm"
                  : "bg-zinc-50 text-zinc-700 border border-zinc-100 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <img src={AI_AVATAR} alt="assistant" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger
              className="w-[130px] rounded-full border-zinc-200 bg-zinc-50 text-sm font-body"
              data-testid="chat-language-select"
            >
              <Languages className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            data-testid="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 rounded-full border-zinc-200 bg-zinc-50 px-4 py-2.5 font-body text-sm"
            ref={inputRef}
          />

          <Button
            data-testid="chat-mic-btn"
            onClick={toggleMic}
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            className={`rounded-full h-10 w-10 flex-shrink-0 ${
              isListening ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-zinc-600" />}
          </Button>

          <Button
            data-testid="chatbot-submit-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full h-10 px-5 bg-zinc-900 hover:bg-zinc-700 text-white font-body text-sm font-medium disabled:opacity-30"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Translate
          </Button>
        </div>
      </div>
    </div>
  );
}
