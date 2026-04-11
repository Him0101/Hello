import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Globe, Headphones, FileText, MessageSquarePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FREE_FEATURES = [
  { icon: MessageSquarePlus, text: "5 translations per day" },
  { icon: Globe, text: "7 languages supported" },
  { icon: FileText, text: "Basic text translation" },
];
const PRO_FEATURES = [
  { icon: Zap, text: "Unlimited translations" },
  { icon: Globe, text: "22+ Indian languages" },
  { icon: FileText, text: "Document translation" },
  { icon: Headphones, text: "Priority speech-to-text" },
  { icon: MessageSquarePlus, text: "Advanced chatbot mode" },
  { icon: Crown, text: "API access for developers" },
];

export default function UpgradePage({ user, onSignIn }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) { onSignIn(); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert("Payment error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto" data-testid="upgrade-page">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron text-[11px] font-body font-semibold mb-4">
            <Crown className="w-3.5 h-3.5" /> Upgrade to Premium
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Unlock the full power of Sarvbhasa</h1>
          <p className="font-body text-sm text-zinc-500 mt-2 max-w-md mx-auto">Get unlimited translations, more languages, and advanced features</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-zinc-200 p-6">
            <h3 className="font-heading text-lg font-bold text-zinc-900 mb-1">Free</h3>
            <p className="font-body text-[11px] text-zinc-400 mb-4">Get started with basic features</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-heading text-3xl font-bold text-zinc-900">&#8377;0</span>
              <span className="font-body text-sm text-zinc-400">/month</span>
            </div>
            <div className="space-y-3 mb-6">
              {FREE_FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (<div key={i} className="flex items-center gap-3 text-[13px] font-body text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0"><Icon className="w-3 h-3 text-zinc-400" /></div>
                  {f.text}
                </div>);
              })}
            </div>
            <Button variant="outline" className="w-full rounded-full font-body text-[13px]" disabled>Current Plan</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl border-2 border-saffron/30 bg-gradient-to-b from-saffron/5 to-white p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-saffron text-white text-[10px] font-body font-bold uppercase tracking-wider">Recommended</div>
            <h3 className="font-heading text-lg font-bold text-zinc-900 mb-1">Premium</h3>
            <p className="font-body text-[11px] text-zinc-400 mb-4">Everything unlimited</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-heading text-3xl font-bold text-zinc-900">&#8377;499</span>
              <span className="font-body text-sm text-zinc-400">/month</span>
            </div>
            <div className="space-y-3 mb-6">
              {PRO_FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (<div key={i} className="flex items-center gap-3 text-[13px] font-body text-zinc-600">
                  <div className="w-5 h-5 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-saffron" /></div>
                  {f.text}
                </div>);
              })}
            </div>
            <Button data-testid="upgrade-pro-btn" onClick={handleUpgrade} disabled={loading || user?.is_premium}
              className="w-full rounded-full bg-gradient-to-r from-saffron to-india-green hover:opacity-90 text-white font-body text-[13px] font-medium disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : user?.is_premium ? "Already Premium" : !user ? "Sign In to Upgrade" : "Upgrade to Premium"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
