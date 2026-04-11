import { useState, useCallback } from "react";
import "@/App.css";
import Topbar from "@/components/Topbar";
import HeroSection from "@/components/HeroSection";
import LoadingScreen from "@/components/LoadingScreen";
import MainApp from "@/components/MainApp";
import { AnimatePresence } from "framer-motion";

function App() {
  const [currentView, setCurrentView] = useState("landing");

  const handleExperience = useCallback(() => {
    setCurrentView("loading");
    setTimeout(() => {
      setCurrentView("app");
    }, 2000);
  }, []);

  const handleBackToLanding = useCallback(() => {
    setCurrentView("landing");
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
        {currentView === "loading" && (
          <LoadingScreen key="loading" />
        )}
        {currentView === "app" && (
          <MainApp key="app" onBack={handleBackToLanding} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
