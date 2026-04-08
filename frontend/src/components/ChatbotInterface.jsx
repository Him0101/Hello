import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";
const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/127956fb27e12c22f854fdbc7acf424e2c0efffa35955b88dfdf5f362c6b9bef.png";
const USER_AVATAR = "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/a1ea70de2b472683ad014fef727a326d27f6d885387992f1b26df4b90a7e06be.png";

const MOCK_RESPONSES = [
  "Namaste! I can help you with translations across multiple Indian languages including Hindi, Marathi, Gujarati, English, and Malayalam.",
  "Sarvbhasa uses the Sarvam Maurya API to provide high-quality translations. How can I assist you today?",
  "I'd be happy to help! You can ask me to translate text between any of the supported languages.",
  "That's a great question! Sarvbhasa supports 5 languages currently and we're expanding to more regional languages soon.",
  "The Sarvam Maurya API powers all our translations with state-of-the-art AI models built specifically for Indian languages.",
];

export default function ChatbotInterface({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Sarvbhasa! I'm your multilingual AI assistant. Ask me anything about Indian language translation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // MOCKED AI response
    setTimeout(() => {
      const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
        },
      ]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      data-testid="chatbot-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-white"
    >
      {/* Chat Header */}
      <div className="border-b border-zinc-100 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-4 h-16">
          <button
            data-testid="chatbot-back-btn"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Sarvbhasa" className="h-8 w-8 object-contain" />
            <div>
              <h2 className="font-heading text-sm font-semibold text-zinc-900 tracking-tight">
                Sarvbhasa
              </h2>
              <p className="text-[11px] font-body text-zinc-400">Multilingual AI Assistant</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-india-green animate-pulse" />
            <span className="text-[11px] font-body text-zinc-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <img
                src={AI_AVATAR}
                alt="assistant"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Input
              data-testid="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 rounded-full border-zinc-200 bg-zinc-50 px-5 py-5 font-body text-sm placeholder:text-zinc-400 focus-visible:ring-saffron/30"
            />
            <Button
              data-testid="chatbot-submit-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="h-10 w-10 rounded-full bg-zinc-900 hover:bg-zinc-700 transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
          <p className="text-center text-[10px] font-body text-zinc-300 mt-3">
            Powered by Sarvam Maurya API
          </p>
        </div>
      </div>
    </motion.div>
  );
}
