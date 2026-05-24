import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  MessageSquarePlus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const API = `${BACKEND_URL}/api`;

const AI_AVATAR =
  "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/127956fb27e12c22f854fdbc7acf424e2c0efffa35955b88dfdf5f362c6b9bef.png";

const USER_AVATAR =
  "https://static.prod-images.emergentagent.com/jobs/503166d7-4d51-4d1d-b65f-7e9554796752/images/a1ea70de2b472683ad014fef727a326d27f6d885387992f1b26df4b90a7e06be.png";

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
  "en-IN":
    "https://images.unsplash.com/photo-1723564211725-97aa919fc0eb?w=800&q=50",
  "hi-IN":
    "https://images.unsplash.com/photo-1589651375281-c3e9308ae434?w=800&q=50",
  "mr-IN":
    "https://images.unsplash.com/photo-1682830819658-841ec2e66bf4?w=800&q=50",
  "gu-IN":
    "https://images.unsplash.com/photo-1475608895924-884f5fcbf109?w=800&q=50",
  "bn-IN":
    "https://images.unsplash.com/photo-1760344654401-43c9fac457ff?w=800&q=50",
  "kn-IN":
    "https://images.unsplash.com/photo-1708590856768-61f5a9cae9a2?w=800&q=50",
  "ml-IN":
    "https://images.unsplash.com/photo-1771575520248-d1b6dc106326?w=800&q=50",
  "ta-IN":
    "https://images.unsplash.com/photo-1708590856768-61f5a9cae9a2?w=800&q=50",
  "te-IN":
    "https://images.unsplash.com/photo-1723564211725-97aa919fc0eb?w=800&q=50",
  "pa-IN":
    "https://images.unsplash.com/photo-1682830819658-841ec2e66bf4?w=800&q=50",
};

const LANG_SHORT = {
  "en-IN": "EN",
  "hi-IN": "HI",
  "mr-IN": "MR",
  "gu-IN": "GU",
  "bn-IN": "BN",
  "kn-IN": "KN",
  "ml-IN": "ML",
  "ta-IN": "TA",
  "te-IN": "TE",
  "pa-IN": "PA",
};

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Sarvbhasa! Ask any question or ask me to translate. I can work like an AI chatbot and translator.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState("en-IN");
  const [targetLang, setTargetLang] = useState("hi-IN");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`${API}/chat/threads`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Fetch threads error:", error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadThread = async (threadId) => {
    setActiveThreadId(threadId);

    try {
      const response = await fetch(`${API}/chat/threads/${threadId}/messages`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
          setMessages(
            data.map((message, index) => ({
              id: `${threadId}-${index}`,
              role: message.role,
              content: message.content,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Load thread error:", error);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to Sarvbhasa! Ask any question or ask me to translate. I can work like an AI chatbot and translator.",
      },
    ]);
  };

  const deleteThread = async (event, threadId) => {
    event.stopPropagation();

    try {
      await fetch(`${API}/chat/threads/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setThreads((prev) => prev.filter((item) => item.thread_id !== threadId));

      if (activeThreadId === threadId) {
        startNewChat();
      }
    } catch (error) {
      console.error("Delete thread error:", error);
    }
  };

  const handleSend = async () => {
    const text = input.trim();

    if (!text || isTyping) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      console.log("Sending chat request to:", `${API}/chat`);

      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: text,
          language: sourceLang,
          target_language: targetLang,
          thread_id: activeThreadId,
        }),
      });

      const data = await response.json();

      console.log("Chat response:", data);

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Chat failed");
      }

      const botReply =
        data.content ||
        data.reply ||
        data.message ||
        "No response received from backend.";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: botReply,
        },
      ]);

      if (data.thread_id) {
        setActiveThreadId(data.thread_id);
      }

      await fetchThreads();
    } catch (error) {
      console.error("Chat send error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Connection error. Backend not reached. Check backend is running on http://localhost:8000.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = sourceLang;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const bgImage = LANG_IMAGES[targetLang] || LANG_IMAGES["en-IN"];

  const groupedThreads = {};

  threads.forEach((thread) => {
    const date = new Date(thread.updated_at || thread.created_at);
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    let label = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    }

    if (!groupedThreads[label]) {
      groupedThreads[label] = [];
    }

    groupedThreads[label].push(thread);
  });

  return (
    <div className="flex h-full" data-testid="chat-page">
      {showHistory && (
        <div
          className="w-56 border-r border-zinc-100 flex flex-col bg-zinc-50/50 flex-shrink-0"
          data-testid="chat-history-sidebar"
        >
          <div className="px-3 py-3 border-b border-zinc-100 flex items-center justify-between">
            <span className="font-heading text-[12px] font-semibold text-zinc-700">
              Chat History
            </span>

            <div className="flex gap-1">
              <button
                onClick={startNewChat}
                className="p-1 rounded hover:bg-zinc-200 transition-colors"
                data-testid="chat-new-thread-btn"
                title="New Chat"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded hover:bg-zinc-200 transition-colors"
                title="Hide"
              >
                <PanelLeftClose className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
            {threads.length === 0 ? (
              <p className="text-[11px] font-body text-zinc-400 text-center py-8">
                No conversations yet
              </p>
            ) : (
              Object.entries(groupedThreads).map(([date, items]) => (
                <div key={date}>
                  <p className="text-[9px] font-body font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1">
                    {date}
                  </p>

                  {items.map((thread) => (
                    <button
                      key={thread.thread_id}
                      onClick={() => loadThread(thread.thread_id)}
                      data-testid={`thread-${thread.thread_id}`}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-body truncate flex items-center gap-1 group transition-colors ${
                        activeThreadId === thread.thread_id
                          ? "bg-white border border-zinc-200 text-zinc-900 font-medium shadow-sm"
                          : "text-zinc-600 hover:bg-white/70"
                      }`}
                    >
                      <span className="text-[9px] font-mono text-saffron mr-1">
                        {LANG_SHORT[thread.source_language] || "?"}
                      </span>

                      <span className="truncate flex-1">
                        {thread.title || "New Chat"}
                      </span>

                      <button
                        onClick={(event) =>
                          deleteThread(event, thread.thread_id)
                        }
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-zinc-400" />
                      </button>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 relative">
        <img src={bgImage} alt="" className="lang-bg-image" />

        <div className="relative z-10 border-b border-zinc-100 bg-white/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showHistory && (
              <button
                onClick={() => setShowHistory(true)}
                className="p-1 rounded hover:bg-zinc-100 transition-colors mr-1"
              >
                <PanelLeftOpen className="w-4 h-4 text-zinc-400" />
              </button>
            )}

            <div>
              <h1 className="font-heading text-lg font-bold tracking-tight text-zinc-900">
                Multilingual AI Chatbot
              </h1>
              <p className="font-body text-[11px] text-zinc-400">
                Powered by Sarvam Maurya API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-india-green animate-pulse" />
            <span className="text-[11px] font-body text-zinc-400">
              Online
            </span>
          </div>
        </div>

        <div
          className="relative z-10 flex-1 overflow-y-auto px-5 py-5 space-y-4"
          ref={scrollRef}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex gap-2.5 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <img
                src={msg.role === "assistant" ? AI_AVATAR : USER_AVATAR}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />

              <div
                className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-[13px] font-body leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-saffron to-saffron/80 text-white rounded-tr-sm shadow-sm"
                    : "bg-white/90 text-zinc-700 border border-zinc-100 rounded-tl-sm shadow-sm backdrop-blur-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <img
                src={AI_AVATAR}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />

              <div className="bg-white/90 border border-zinc-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-saffron/60 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 border-t border-zinc-100 bg-white/90 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger
                className="w-[100px] rounded-full border-zinc-200 bg-zinc-50 text-[11px] font-body h-9"
                data-testid="chat-source-lang"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.code}
                    value={lang.code}
                    className="text-[12px]"
                  >
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-zinc-300 text-[10px]">→</span>

            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger
                className="w-[100px] rounded-full border-zinc-200 bg-zinc-50 text-[11px] font-body h-9"
                data-testid="chat-target-lang"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.code}
                    value={lang.code}
                    className="text-[12px]"
                  >
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              data-testid="chatbot-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              className="flex-1 rounded-full border-zinc-200 bg-zinc-50 px-4 h-9 font-body text-[13px]"
            />

            <Button
              data-testid="chat-mic-btn"
              onClick={toggleMic}
              variant="outline"
              size="icon"
              className={`rounded-full h-9 w-9 flex-shrink-0 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 border-red-500 text-white"
                  : "border-zinc-200"
              }`}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </Button>

            <Button
              data-testid="chatbot-submit-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-full h-9 px-4 bg-india-green hover:bg-india-green/90 text-white font-body text-[12px] font-medium disabled:opacity-30 gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}