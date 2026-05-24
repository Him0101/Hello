
import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import Topbar from "@/components/Topbar";
import HeroSection from "@/components/HeroSection";
import LoadingScreen from "@/components/LoadingScreen";
import MainApp from "@/components/MainApp";
import AuthModal from "@/components/AuthModal";
import { AnimatePresence } from "framer-motion";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // 🔐 track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          uid: u.uid,
          email: u.email,
          name: u.displayName
        });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  // 🚀 EXPERIENCE BUTTON → SHOW LOADING FIRST
  const handleExperience = useCallback(() => {
    setCurrentView("loading");

    // simulate loading delay
    setTimeout(() => {
      setCurrentView("app");
    }, 1800); // match your loading animation
  }, []);

  // 🚪 logout
  const handleLogout = useCallback(async () => {
    await signOut(auth);
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

        {/* 🆕 LOADING SCREEN */}
        {currentView === "loading" && (
          <LoadingScreen key="loading" />
        )}

        {currentView === "app" && (
          <MainApp
            key="app"
            user={user}
            setUser={setUser}
            onLogout={handleLogout}
            onOpenAuth={() => setShowAuth(true)}
          />
        )}

      </AnimatePresence>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => {
              setUser(u);
              setShowAuth(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
