// import { useState } from "react";
// import { motion } from "framer-motion";
// import Sidebar from "@/components/Sidebar";
// import HomePage from "@/components/HomePage";
// import ChatPage from "@/components/ChatPage";
// import TextTranslatePage from "@/components/TextTranslatePage";
// import SpeechToTextPage from "@/components/SpeechToTextPage";
// import UpgradePage from "@/components/UpgradePage";
// import AuthModal from "@/components/AuthModal";
// import TranslationHistory from "@/components/TranslationHistory";
// import PaymentStatus from "@/components/PaymentStatus";

// export default function MainApp({ onBack, user, setUser, onLogout }) {
//   const [activePage, setActivePage] = useState(() => {
//     const params = new URLSearchParams(window.location.search);
//     return params.get("session_id") ? "payment-success" : "home";
//   });
//   const [sidebarExpanded, setSidebarExpanded] = useState(true);
//   const [showAuth, setShowAuth] = useState(false);
//   const [authTab, setAuthTab] = useState("login");

//   const handleNavigation = (page) => {
//     if (page === "signin") {
//       setAuthTab("login");
//       setShowAuth(true);
//       return;
//     }
//     setActivePage(page);
//   };

//   const handleAuthSuccess = (userData) => {
//     setUser(userData);
//     setShowAuth(false);
//   };

//   const renderPage = () => {
//     switch (activePage) {
//       case "home": return <HomePage onNavigate={handleNavigation} />;
//       case "chat": case "newchat": return <ChatPage key={activePage === "newchat" ? Date.now() : "chat"} user={user} />;
//       case "translate": return <TextTranslatePage user={user} />;
//       case "speech": return <SpeechToTextPage />;
//       case "upgrade": return <UpgradePage user={user} onSignIn={() => { setAuthTab("login"); setShowAuth(true); }} />;
//       case "history": return <TranslationHistory user={user} />;
//       case "payment-success": return <PaymentStatus />;
//       default: return <HomePage onNavigate={handleNavigation} />;
//     }
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-screen bg-white overflow-hidden" data-testid="main-app">
//       <Sidebar
//         expanded={sidebarExpanded}
//         onToggle={() => setSidebarExpanded(!sidebarExpanded)}
//         activePage={activePage}
//         onNavigate={handleNavigation}
//         user={user}
//         onLogout={onLogout}
//         onBack={onBack}
//       />
//       <main className="flex-1 overflow-hidden">{renderPage()}</main>
//       {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} defaultTab={authTab} />}
//     </motion.div>
//   );
// }





import { useState } from "react";
import { motion } from "framer-motion";

import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/HomePage";
import ChatPage from "@/components/ChatPage";
import TextTranslatePage from "@/components/TextTranslatePage";
import SpeechToTextPage from "@/components/SpeechToTextPage";
import UpgradePage from "@/components/UpgradePage";
import AuthModal from "@/components/AuthModal";
import TranslationHistory from "@/components/TranslationHistory";
import PaymentStatus from "@/components/PaymentStatus";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MainApp({ onBack, user, setUser, onLogout }) {
  const [activePage, setActivePage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id") ? "payment-success" : "chat";
  });

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  // 🔥 ADD: Sync user to MongoDB (SAFE ADDITION)
  const syncUserToBackend = async (u) => {
    try {
      await fetch(`${BACKEND_URL}/api/user/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u)
      });
    } catch (err) {
      console.log("user sync failed:", err);
    }
  };

  // 🔥 NAVIGATION (UNCHANGED)
  const handleNavigation = (page) => {
    switch (page) {
      case "signin":
        setAuthTab("login");
        setShowAuth(true);
        return;

      case "history":
        if (!user) {
          setAuthTab("login");
          setShowAuth(true);
          return;
        }
        setActivePage("history");
        return;

      case "upgrade":
        setActivePage("upgrade");
        return;

      default:
        setActivePage(page);
    }
  };

  // 🔥 AUTH SUCCESS (ONLY ADD SYNC CALL)
  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    setShowAuth(false);

    // 🧠 NEW: store user in MongoDB
    await syncUserToBackend(userData);
  };

  // 🧠 ADD: Save chat (HOOK ONLY, NO UI CHANGE)
  const saveChat = async (message, response) => {
    if (!user) return;

    try {
      await fetch(`${BACKEND_URL}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          message,
          response
        })
      });
    } catch (err) {
      console.log("chat save failed:", err);
    }
  };

  // 🧠 PAGE RENDER (UNCHANGED)
  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage onNavigate={handleNavigation} />;

      case "chat":
      case "newchat":
        return (
          <ChatPage
            key={activePage === "newchat" ? Date.now() : "chat"}
            user={user}
            onSave={saveChat}   // 🔥 ONLY ADD
          />
        );

      case "translate":
        return <TextTranslatePage user={user} />;

      case "speech":
        return <SpeechToTextPage />;

      case "upgrade":
        return (
          <UpgradePage
            user={user}
            onSignIn={() => {
              setAuthTab("login");
              setShowAuth(true);
            }}
          />
        );

      case "history":
        return <TranslationHistory user={user} />;

      case "payment-success":
        return <PaymentStatus />;

      default:
        return <ChatPage user={user} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen bg-white overflow-hidden"
    >
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        activePage={activePage}
        onNavigate={handleNavigation}
        user={user}
        onLogout={onLogout}
        onBack={onBack}
      />

      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          defaultTab={authTab}
        />
      )}
    </motion.div>
  );
}
