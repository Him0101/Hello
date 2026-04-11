import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import Topbar from "@/components/Topbar";
import HeroSection from "@/components/HeroSection";
import LoadingScreen from "@/components/LoadingScreen";
import MainApp from "@/components/MainApp";
import AuthCallback from "@/components/AuthCallback";
import { AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check for OAuth callback session_id in hash
  const hashParams = window.location.hash;
  const hasSessionId = hashParams?.includes("session_id=");

  // Check existing auth on mount
  useEffect(() => {
    if (hasSessionId) { setAuthChecked(true); return; }
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
      setAuthChecked(true);
    };
    checkAuth();
  }, [hasSessionId]);

  const handleExperience = useCallback(() => {
    setCurrentView("loading");
    setTimeout(() => setCurrentView("app"), 2000);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setCurrentView("landing");
  }, []);

  const handleAuthComplete = useCallback((userData) => {
    setUser(userData);
    setCurrentView("app");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
  }, []);

  // Handle OAuth callback
  if (hasSessionId) {
    return <AuthCallback onComplete={handleAuthComplete} />;
  }

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
            onBack={handleBackToLanding}
            user={user}
            onLogout={handleLogout}
            onSignIn={() => {
              // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
              const redirectUrl = window.location.origin + "/#auth";
              window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
