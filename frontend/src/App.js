import { useState } from "react";
import "@/App.css";
import Topbar from "@/components/Topbar";
import HeroSection from "@/components/HeroSection";
import LoadingScreen from "@/components/LoadingScreen";
import ChatbotInterface from "@/components/ChatbotInterface";
import { AnimatePresence } from "framer-motion";

function App() {
  const [currentView, setCurrentView] = useState("landing");

  const handleExperience = () => {
    setCurrentView("loading");
    setTimeout(() => {
      setCurrentView("chatbot");
    }, 2000);
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
  };

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

        {currentView === "chatbot" && (
          <ChatbotInterface key="chatbot" onBack={handleBackToLanding} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
