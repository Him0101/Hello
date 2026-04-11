import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send as TelegramIcon, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInModal({ onClose, onSignIn }) {
  const [mode, setMode] = useState("options"); // options | email
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleGoogleSignIn = () => {
    // Mock Google sign in - prompt for name
    setMode("google");
  };

  const handleTelegramSignIn = () => {
    setMode("telegram");
  };

  const handleTwitterSignIn = () => {
    setMode("twitter");
  };

  const handleSubmitName = (provider) => {
    if (!name.trim()) return;
    onSignIn({ name: name.trim(), email: email || `${name.trim().toLowerCase()}@${provider}.com`, provider });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" data-testid="signin-modal">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="font-heading text-lg font-bold tracking-tight text-zinc-900">
            Sign In
          </h2>
          <button
            data-testid="signin-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {mode === "options" && (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 mt-4"
              >
                <p className="font-body text-sm text-zinc-500 mb-4">
                  Choose how you'd like to sign in to Sarvbhasa
                </p>

                {/* Google */}
                <button
                  data-testid="signin-google-btn"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all font-body text-sm font-medium text-zinc-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Telegram */}
                <button
                  data-testid="signin-telegram-btn"
                  onClick={handleTelegramSignIn}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all font-body text-sm font-medium text-zinc-700"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <TelegramIcon className="w-3 h-3 text-white" />
                  </div>
                  Continue with Telegram
                </button>

                {/* X / Twitter */}
                <button
                  data-testid="signin-twitter-btn"
                  onClick={handleTwitterSignIn}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all font-body text-sm font-medium text-zinc-700"
                >
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <Twitter className="w-3 h-3 text-white" />
                  </div>
                  Continue with X / Twitter
                </button>

                {/* Email */}
                <button
                  data-testid="signin-email-btn"
                  onClick={() => setMode("email")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all font-body text-sm font-medium text-zinc-700"
                >
                  <Mail className="w-5 h-5 text-zinc-500" />
                  Continue with Email
                </button>
              </motion.div>
            )}

            {(mode === "google" || mode === "telegram" || mode === "twitter") && (
              <motion.div
                key="provider"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mt-4"
              >
                <p className="font-body text-sm text-zinc-500">
                  {mode === "google" && "Sign in with your Google account"}
                  {mode === "telegram" && "Sign in with your Telegram account"}
                  {mode === "twitter" && "Sign in with your X / Twitter account"}
                </p>
                <div>
                  <label className="text-xs font-body font-medium text-zinc-500 mb-1.5 block">Your Name</label>
                  <Input
                    data-testid="signin-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitName(mode)}
                    placeholder="e.g. Hola"
                    className="rounded-lg font-body"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setMode("options"); setName(""); }}
                    className="flex-1 rounded-lg font-body text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    data-testid="signin-submit-btn"
                    onClick={() => handleSubmitName(mode)}
                    disabled={!name.trim()}
                    className="flex-1 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white font-body text-sm disabled:opacity-30"
                  >
                    Sign In
                  </Button>
                </div>
              </motion.div>
            )}

            {mode === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mt-4"
              >
                <p className="font-body text-sm text-zinc-500">Sign in with your email</p>
                <div>
                  <label className="text-xs font-body font-medium text-zinc-500 mb-1.5 block">Name</label>
                  <Input
                    data-testid="signin-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-lg font-body"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-body font-medium text-zinc-500 mb-1.5 block">Email</label>
                  <Input
                    data-testid="signin-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitName("email")}
                    placeholder="you@example.com"
                    type="email"
                    className="rounded-lg font-body"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setMode("options"); setName(""); setEmail(""); }}
                    className="flex-1 rounded-lg font-body text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    data-testid="signin-submit-btn"
                    onClick={() => handleSubmitName("email")}
                    disabled={!name.trim()}
                    className="flex-1 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white font-body text-sm disabled:opacity-30"
                  >
                    Sign In
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
