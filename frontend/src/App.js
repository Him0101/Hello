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

  // Check for payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      setCurrentView("app");
    }
  }, []);

  // Check existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
        if (res.ok) setUser(await res.json());
      } catch {}
    };
    checkAuth();
  }, []);

  const handleExperience = useCallback(() => {
    setCurrentView("loading");
    setTimeout(() => setCurrentView("app"), 2000);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    setUser(null);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentView === "landing" && (
          <div key="landing">
            <Topbar onExperience={handleExperience} />
            <HeroSection onExperience={handleExperience} />
          </div>
        )}
        {currentView === "loading" && <LoadingScreen key="loading" />}
        {currentView === "app" && (
          <MainApp
            key="app"
            onBack={() => setCurrentView("landing")}
            user={user}
            setUser={setUser}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
