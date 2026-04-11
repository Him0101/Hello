import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function formatError(detail) {
  if (!detail) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

export default function AuthModal({ onClose, onSuccess, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = tab === "register" ? "/api/auth/register" : "/api/auth/login";
    const body = tab === "register" ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(formatError(data.detail));
      } else {
        onSuccess(data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" data-testid="auth-modal">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Close */}
        <button data-testid="auth-close-btn" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-100 z-10">
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Tab header */}
        <div className="flex border-b border-zinc-100">
          <button data-testid="auth-login-tab" onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-4 text-[13px] font-body font-medium transition-colors ${tab === "login" ? "text-zinc-900 border-b-2 border-saffron" : "text-zinc-400"}`}>
            Sign In
          </button>
          <button data-testid="auth-register-tab" onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-4 text-[13px] font-body font-medium transition-colors ${tab === "register" ? "text-zinc-900 border-b-2 border-india-green" : "text-zinc-400"}`}>
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {tab === "register" && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Name</label>
                <Input data-testid="auth-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-lg font-body text-[13px]" required />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Email</label>
            <Input data-testid="auth-email-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="rounded-lg font-body text-[13px]" required />
          </div>

          <div>
            <label className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative">
              <Input data-testid="auth-password-input" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" type={showPw ? "text" : "password"} className="rounded-lg font-body text-[13px] pr-10" required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p data-testid="auth-error" className="text-[12px] font-body text-red-500">{error}</p>}

          <Button data-testid="auth-submit-btn" type="submit" disabled={loading}
            className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white font-body text-[13px] font-medium disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {tab === "register" ? "Create Account" : "Sign In"}
          </Button>

          {/* Social divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-[10px] font-body text-zinc-400 uppercase">or continue with</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button type="button" data-testid="auth-google-btn"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-[11px] font-body font-medium text-zinc-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" data-testid="auth-twitter-btn"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-[11px] font-body font-medium text-zinc-600">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
            <button type="button" data-testid="auth-telegram-btn"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-[11px] font-body font-medium text-zinc-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>
          <p className="text-center text-[10px] font-body text-zinc-300">Social login coming soon</p>
        </form>
      </motion.div>
    </div>
  );
}
