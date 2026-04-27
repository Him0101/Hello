import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import Topbar from "@/components/Topbar";
import HeroSection from "@/components/HeroSection";
import LoadingScreen from "@/components/LoadingScreen";
import MainApp from "@/components/MainApp";
import { AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const hide = () => { const b = document.getElementById("emergent-badge"); if (b) b.remove(); };
    hide(); const obs = new MutationObserver(hide); obs.observe(document.body, { childList: true, subtree: true }); return () => obs.disconnect();
  }, []);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("session_id")) setCurrentView("app"); }, []);

  useEffect(() => {
    (async () => { try { const r = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" }); if (r.ok) setUser(await r.json()); } catch {} })();
  }, []);

  useEffect(() => {
    const handler = async (e) => {
      if (e.data?.type === "google-auth-callback" && e.data?.session_id) {
        try {
          const r = await fetch(`${BACKEND_URL}/api/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ session_id: e.data.session_id }) });
          if (r.ok) { setUser(await r.json()); setCurrentView("app"); }
        } catch {}
      }
    };
    window.addEventListener("message", handler); return () => window.removeEventListener("message", handler);
  }, []);

  const handleExperience = useCallback(() => { setCurrentView("loading"); setTimeout(() => setCurrentView("app"), 2000); }, []);
  const handleLogout = useCallback(async () => { try { await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" }); } catch {} setUser(null); }, []);

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentView === "landing" && <div key="landing"><Topbar onExperience={handleExperience} /><HeroSection onExperience={handleExperience} /></div>}
        {currentView === "loading" && <LoadingScreen key="loading" />}
        {currentView === "app" && <MainApp key="app" onBack={() => setCurrentView("landing")} user={user} setUser={setUser} onLogout={handleLogout} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
