import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PaymentStatus() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }

    let attempts = 0;
    const poll = async () => {
      if (attempts >= 5) { setStatus("timeout"); return; }
      attempts++;
      try {
        const res = await fetch(`${BACKEND_URL}/api/payments/status/${sessionId}`, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          setData(d);
          if (d.payment_status === "paid") { setStatus("success"); return; }
          if (d.status === "expired") { setStatus("expired"); return; }
        }
      } catch {}
      setTimeout(poll, 2000);
    };
    poll();
  }, []);

  return (
    <div className="h-full flex items-center justify-center" data-testid="payment-status-page">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm mx-auto p-8">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-saffron animate-spin mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-zinc-900 mb-2">Processing Payment</h2>
            <p className="font-body text-sm text-zinc-500">Please wait while we confirm your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-14 h-14 text-india-green mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-zinc-900 mb-2">Payment Successful!</h2>
            <p className="font-body text-sm text-zinc-500 mb-6">Welcome to Sarvbhasa Premium. Enjoy unlimited translations!</p>
            <Button onClick={() => { window.history.replaceState(null, "", window.location.pathname); window.location.reload(); }}
              className="rounded-full bg-india-green hover:bg-india-green/90 text-white font-body text-[13px]">
              Continue to App
            </Button>
          </>
        )}
        {(status === "error" || status === "expired" || status === "timeout") && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-zinc-900 mb-2">Payment Issue</h2>
            <p className="font-body text-sm text-zinc-500 mb-6">
              {status === "expired" ? "Session expired." : "Could not confirm payment."} Please try again.
            </p>
            <Button onClick={() => { window.history.replaceState(null, "", window.location.pathname); window.location.reload(); }}
              variant="outline" className="rounded-full font-body text-[13px]">
              Back to App
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
