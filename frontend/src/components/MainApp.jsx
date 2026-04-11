import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/HomePage";
import ChatPage from "@/components/ChatPage";
import TextTranslatePage from "@/components/TextTranslatePage";
import SpeechToTextPage from "@/components/SpeechToTextPage";
import SignInModal from "@/components/SignInModal";

export default function MainApp({ onBack }) {
  const [activePage, setActivePage] = useState("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sarvbhasa_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleSignIn = (userData) => {
    setUser(userData);
    localStorage.setItem("sarvbhasa_user", JSON.stringify(userData));
    setShowSignIn(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sarvbhasa_user");
  };

  const handleNavigation = (page) => {
    if (page === "signin") {
      setShowSignIn(true);
    } else {
      setActivePage(page);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage onNavigate={handleNavigation} />;
      case "chat":
      case "newchat":
        return <ChatPage key={activePage === "newchat" ? Date.now() : "chat"} />;
      case "translate":
        return <TextTranslatePage />;
      case "speech":
        return <SpeechToTextPage />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen bg-white overflow-hidden"
      data-testid="main-app"
    >
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        activePage={activePage}
        onNavigate={handleNavigation}
        user={user}
        onLogout={handleLogout}
        onBack={onBack}
      />

      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSignIn={handleSignIn}
        />
      )}
    </motion.div>
  );
}
