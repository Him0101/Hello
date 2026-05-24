import { useState } from "react";
import {
  Home, MessageSquarePlus, MessageSquare, Languages, Mic, Crown, LogIn,
  ChevronLeft, ChevronRight, LogOut, HelpCircle, ArrowLeft, Phone, History,
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "newchat", label: "New Chat", icon: MessageSquarePlus },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "translate", label: "Text to Text Translate", icon: Languages },
  { id: "speech", label: "Speech to Text", icon: Mic },
  { id: "history", label: "Translation History", icon: History },
];

export default function Sidebar({ expanded, onToggle, activePage, onNavigate, user, onLogout, onBack }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const supportNumber = "91" + Math.floor(7000000000 + Math.random() * 2999999999);

  return (
    <aside data-testid="sidebar" className={`flex flex-col h-full bg-white transition-all duration-300 relative ${expanded ? "w-64" : "w-16"} border-r border-zinc-100`}>
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-zinc-100 gap-2">
        {expanded && (
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors" data-testid="sidebar-back-btn">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </button>
        )}
        <img src={LOGO_URL} alt="Sarvbhasa" className="h-7 w-7 object-contain flex-shrink-0" />
        {expanded && <span className="font-heading text-sm font-bold tracking-tight text-zinc-900">SARVBHASA</span>}
        <button onClick={onToggle} className="ml-auto p-1 rounded-lg hover:bg-zinc-100 transition-colors" data-testid="sidebar-toggle-btn">
          {expanded ? <ChevronLeft className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>
      <div className="h-0.5 tricolor-bar" />

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === "chat" && activePage === "newchat");
          return (
            <button key={item.id} data-testid={`sidebar-${item.id}-btn`} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 ${expanded ? "px-3 py-2" : "px-0 py-2 justify-center"} ${
                isActive ? "bg-gradient-to-r from-saffron/10 to-india-green/10 text-zinc-900 font-semibold" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              }`} title={!expanded ? item.label : undefined}>
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-saffron" : ""}`} />
              {expanded && <span className="text-[13px] font-body truncate">{item.label}</span>}
            </button>
          );
        })}

        {/* Upgrade */}
        <button data-testid="sidebar-upgrade-btn" onClick={() => onNavigate("upgrade")}
          className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 ${expanded ? "px-3 py-2" : "px-0 py-2 justify-center"} ${
            activePage === "upgrade" ? "bg-saffron/10 text-saffron" : "text-saffron/70 hover:bg-saffron/5 hover:text-saffron"
          }`} title={!expanded ? "Upgrade to Premium" : undefined}>
          <Crown className="w-[18px] h-[18px] flex-shrink-0" />
          {expanded && (
            <>
              <span className="text-[13px] font-body font-medium truncate">Upgrade to Premium</span>
              <span className="ml-auto text-[9px] font-body font-bold bg-saffron/20 text-saffron px-1.5 py-0.5 rounded-full">PRO</span>
            </>
          )}
        </button>
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-100 p-2 relative">
        {user ? (
          <>
            <button data-testid="sidebar-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-50 transition-colors ${!expanded ? "justify-center px-0" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              {expanded && (
                <div className="text-left truncate">
                  <span className="text-[13px] font-body font-medium block truncate">{user.name}</span>
                  {user.is_premium && <span className="text-[9px] font-body text-saffron font-bold">PREMIUM</span>}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div data-testid="user-menu-dropdown" className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden z-50">
                <button data-testid="user-logout-btn" onClick={() => { onLogout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-body text-zinc-600 hover:bg-zinc-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
                <button data-testid="user-support-btn" onClick={() => setShowSupport(!showSupport)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-body text-zinc-600 hover:bg-zinc-50 transition-colors border-t border-zinc-100">
                  <HelpCircle className="w-4 h-4" /> Support / Help
                </button>
                {showSupport && (
                  <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-[13px] font-body text-zinc-600">
                      <Phone className="w-3.5 h-3.5 text-india-green" />
                      <span>+{supportNumber.slice(0,2)} {supportNumber.slice(2,7)} {supportNumber.slice(7)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">24/7 Support Available</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <button data-testid="sidebar-signin-btn" onClick={() => onNavigate("signin")}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-india-green hover:bg-india-green/5 transition-colors ${!expanded ? "justify-center px-0" : ""}`}>
            <LogIn className="w-[18px] h-[18px] flex-shrink-0" />
            {expanded && <span className="text-[13px] font-body font-medium">Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

