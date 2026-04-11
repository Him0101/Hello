import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";
const LANGUAGES = ["Marathi", "Gujarati", "Hindi", "English", "Malayalam", "Bengali", "Kannada", "Tamil", "Telugu", "Punjabi"];

export default function Topbar({ onExperience }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) { setDropdownOpen(false); setExpandedItem(null); } };
    if (dropdownOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5" ref={dropdownRef}>
        {/* Tricolor top line */}
        <div className="h-0.5 tricolor-bar" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5" data-testid="nav-logo">
            <img src={LOGO_URL} alt="Sarvbhasa" className="h-9 w-9 object-contain" />
            <span className="font-heading text-lg font-semibold tracking-tight text-zinc-900">Sarvbhasa</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button data-testid="nav-platform-dropdown-trigger" onClick={() => { setDropdownOpen(!dropdownOpen); if (dropdownOpen) setExpandedItem(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
              Platform
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
          </nav>
          <Button data-testid="nav-cta-btn" onClick={onExperience}
            className="bg-gradient-to-r from-saffron to-india-green text-white hover:opacity-90 rounded-full px-6 font-body text-sm font-medium transition-opacity">
            Experience Sarvbhasa
          </Button>
        </div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-[4.25rem] bg-white border-b border-zinc-200 shadow-xl z-40">
              <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-heading text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Platform</p>
                  <button onClick={() => { setDropdownOpen(false); setExpandedItem(null); }} className="p-1 rounded-full hover:bg-zinc-100 transition-colors" data-testid="dropdown-close-btn">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div data-testid="dropdown-about-api" className="border border-zinc-100 rounded-lg p-4 cursor-pointer hover:border-saffron/40 transition-colors"
                    onClick={() => setExpandedItem(expandedItem === "about" ? null : "about")}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-semibold text-zinc-900">About Sarvbhasa API</h3>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedItem === "about" ? "rotate-180" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {expandedItem === "about" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="mt-2 text-[13px] font-body text-zinc-500">Uses <span className="font-semibold text-saffron">Sarvam Maurya API</span> — India's most advanced multilingual AI for translation and speech.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div data-testid="dropdown-languages" className="border border-zinc-100 rounded-lg p-4 cursor-pointer hover:border-india-green/40 transition-colors"
                    onClick={() => setExpandedItem(expandedItem === "languages" ? null : "languages")}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-semibold text-zinc-900">Languages Translate</h3>
                      <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedItem === "languages" ? "rotate-180" : ""}`} />
                    </div>
                    <AnimatePresence>
                      {expandedItem === "languages" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {LANGUAGES.map((lang) => (
                              <span key={lang} className="px-2.5 py-0.5 rounded-full text-[11px] font-body font-medium bg-zinc-50 text-zinc-600 border border-zinc-200">{lang}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-[4.25rem] z-30 backdrop-blur-md bg-white/40"
            onClick={() => { setDropdownOpen(false); setExpandedItem(null); }} />
        )}
      </AnimatePresence>
    </>
  );
}
