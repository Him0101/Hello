import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const LANGUAGES = ["Marathi", "Gujarati", "Hindi", "English", "Malayalam"];

export default function Topbar({ onExperience }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setExpandedItem(null);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen) setExpandedItem(null);
  };

  const toggleExpanded = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5"
        ref={dropdownRef}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3" data-testid="nav-logo">
            <img src={LOGO_URL} alt="Sarvbhasa" className="h-10 w-10 object-contain" />
            <span className="font-heading text-xl font-semibold tracking-tight text-zinc-900">
              Sarvbhasa
            </span>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              data-testid="nav-platform-dropdown-trigger"
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              Platform
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </nav>

          {/* CTA */}
          <Button
            data-testid="nav-cta-btn"
            onClick={onExperience}
            className="bg-zinc-900 text-white hover:bg-zinc-700 rounded-full px-6 font-body text-sm font-medium transition-colors"
          >
            Experience Sarvbhasa
          </Button>
        </div>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-20 bg-white border-b border-zinc-200 shadow-xl z-40"
            >
              <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-heading text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Platform
                  </p>
                  <button
                    onClick={() => { setDropdownOpen(false); setExpandedItem(null); }}
                    className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
                    data-testid="dropdown-close-btn"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* About Sarvbhasa API */}
                  <div
                    data-testid="dropdown-about-api"
                    className="border border-zinc-100 rounded-lg p-5 cursor-pointer hover:border-saffron/40 transition-colors"
                    onClick={() => toggleExpanded("about")}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-semibold text-zinc-900">
                        About Sarvbhasa API
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                          expandedItem === "about" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {expandedItem === "about" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm font-body text-zinc-500 leading-relaxed">
                            Uses <span className="font-semibold text-saffron">Sarvam Maurya API</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Languages Translate */}
                  <div
                    data-testid="dropdown-languages"
                    className="border border-zinc-100 rounded-lg p-5 cursor-pointer hover:border-india-green/40 transition-colors"
                    onClick={() => toggleExpanded("languages")}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-semibold text-zinc-900">
                        Languages Translate
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                          expandedItem === "languages" ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {expandedItem === "languages" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-wrap gap-2">
                            {LANGUAGES.map((lang) => (
                              <span
                                key={lang}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium bg-zinc-50 text-zinc-700 border border-zinc-200"
                              >
                                {lang}
                              </span>
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

      {/* Backdrop blur overlay */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-20 z-30 backdrop-blur-md bg-white/40"
            onClick={() => { setDropdownOpen(false); setExpandedItem(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
