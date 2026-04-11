import { useEffect, useRef } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AuthCallback({ onComplete }) {
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) return;

    const sessionId = match[1];

    const exchangeSession = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (res.ok) {
          const userData = await res.json();
          onComplete(userData);
        } else {
          window.location.hash = "";
          window.location.reload();
        }
      } catch {
        window.location.hash = "";
        window.location.reload();
      }
    };

    exchangeSession();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[200]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-body text-sm text-zinc-500">Signing you in...</p>
      </div>
    </div>
  );
}
