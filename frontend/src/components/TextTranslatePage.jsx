// import { useState } from "react";
// import { motion } from "framer-motion";
// import { ArrowLeftRight, Copy, Check, Volume2, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// // ✅ Backend URL FIX
// const API = "http://127.0.0.1:8000/api";


// const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

// const LANGUAGES = [
//   { code: "en-IN", label: "English" },
//   { code: "hi-IN", label: "Hindi" },
//   { code: "mr-IN", label: "Marathi" },
//   { code: "gu-IN", label: "Gujarati" },
//   { code: "bn-IN", label: "Bengali" },
//   { code: "kn-IN", label: "Kannada" },
//   { code: "ml-IN", label: "Malayalam" },
//   { code: "ta-IN", label: "Tamil" },
//   { code: "te-IN", label: "Telugu" },
//   { code: "pa-IN", label: "Punjabi" },
//   { code: "od-IN", label: "Odia" },
//   { code: "as-IN", label: "Assamese" },
// ];

// export default function TextTranslatePage() {
//   const [sourceLang, setSourceLang] = useState("en-IN");
//   const [targetLang, setTargetLang] = useState("hi-IN");
//   const [sourceText, setSourceText] = useState("");
//   const [translatedText, setTranslatedText] = useState("");
//   const [isTranslating, setIsTranslating] = useState(false);
//   const [copied, setCopied] = useState(false);

//   // ✅ FIXED TRANSLATE FUNCTION
//  const handleTranslate = async () => {
//   if (!sourceText.trim()) return;

//   setIsTranslating(true);
//   setTranslatedText("");

//   try {
//     const res = await fetch("http://127.0.0.1:8000/api/translate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         text: sourceText,
//         source_language: sourceLang,
//         target_language: targetLang,
//       }),
//     });

//     const data = await res.json();
//     console.log("API RESPONSE:", data);

//     setTranslatedText(data.translated_text || JSON.stringify(data));

//   } catch (err) {
//     console.error("Frontend Error:", err);
//     setTranslatedText("❌ Cannot connect to backend");
//   }

//   setIsTranslating(false);
// };


//   const handleSwap = () => {
//     setSourceLang(targetLang);
//     setTargetLang(sourceLang);
//     setSourceText(translatedText);
//     setTranslatedText(sourceText);
//   };

//   const handleCopy = () => {
//     if (translatedText) {
//       navigator.clipboard.writeText(translatedText);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const handleSpeak = (text, lang) => {
//     if (!text) return;
//     const u = new SpeechSynthesisUtterance(text);
//     u.lang = lang;
//     speechSynthesis.speak(u);
//   };

//   return (
//     <div className="h-full overflow-y-auto" data-testid="text-translate-page">
//       <div className="max-w-5xl mx-auto px-5 md:px-10 py-6">

//         {/* HEADER */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
//               Text Translate
//             </h1>
//             <p className="font-body text-[11px] text-muted-foreground">
//               Translate between Indian languages using Sarvam AI
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <img src={LOGO_URL} alt="" className="h-7 w-7 object-contain" />
//             <span className="font-heading text-[13px] font-semibold text-zinc-900">
//               Sarvbhasa
//             </span>
//           </div>
//         </motion.div>

//         {/* LANGUAGE SELECT */}
//         <motion.div className="flex items-center gap-3 mb-5">
//           <div className="flex-1">
//             <Select value={sourceLang} onValueChange={setSourceLang}>
//               <SelectTrigger className="w-full rounded-lg">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {LANGUAGES.map((l) => (
//                   <SelectItem key={l.code} value={l.code}>
//                     {l.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <button onClick={handleSwap} className="p-2 rounded-full border">
//             <ArrowLeftRight />
//           </button>

//           <div className="flex-1">
//             <Select value={targetLang} onValueChange={setTargetLang}>
//               <SelectTrigger className="w-full rounded-lg">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {LANGUAGES.map((l) => (
//                   <SelectItem key={l.code} value={l.code}>
//                     {l.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </motion.div>

//         {/* TEXT AREAS */}
//         <motion.div className="grid md:grid-cols-2 gap-4 mb-5">
//           <div className="relative">
//             <Textarea
//               value={sourceText}
//               onChange={(e) => setSourceText(e.target.value)}
//               placeholder="Enter text to translate..."
//               className="min-h-[220px] rounded-xl"
//             />
//           </div>

//           <div className="relative">
//             <Textarea
//               value={isTranslating ? "" : translatedText}
//               readOnly
//               placeholder="Translation will appear here..."
//               className="min-h-[220px] rounded-xl"
//             />

//             {isTranslating && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Loader2 className="w-6 h-6 animate-spin" />
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* BUTTON */}
//         <motion.div className="flex justify-center">
//           <Button
//             onClick={handleTranslate}
//             disabled={!sourceText.trim() || isTranslating}
//             size="lg"
//             className="rounded-full px-10 py-5"
//           >
//             {isTranslating ? "Translating..." : "Translate"}
//           </Button>
//         </motion.div>
//       </div>
//     </div>
//   );
// }





import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = "http://127.0.0.1:8000/api";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "bn-IN", label: "Bengali" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "pa-IN", label: "Punjabi" },
  { code: "od-IN", label: "Odia" },
  { code: "as-IN", label: "Assamese" },
];

export default function TextTranslatePage() {
  const [sourceLang, setSourceLang] = useState("en-IN");
  const [targetLang, setTargetLang] = useState("hi-IN");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTranslatedText("");

    try {
      const res = await fetch(`${API}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          source_language: sourceLang,
          target_language: targetLang,
        }),
      });

      const data = await res.json();
      setTranslatedText(data.translated_text || JSON.stringify(data));
    } catch (err) {
      setTranslatedText("❌ Cannot connect to backend");
    }

    setIsTranslating(false);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    // 🔥 MAIN BACKGROUND FIX HERE
    <div className="wavy-tricolor-bg min-h-screen relative overflow-y-auto">

      {/* CONTENT ABOVE BACKGROUND */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 py-6">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Text Translate</h1>
            <p className="text-sm text-gray-600">
              Translate between Indian languages using Sarvam AI
            </p>
          </div>

          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7" />
            <span className="font-semibold">Sarvbhasa</span>
          </div>
        </motion.div>

        {/* LANGUAGE SELECT */}
        <motion.div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-full rounded-lg bg-white/80 backdrop-blur-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button onClick={handleSwap} className="p-2 rounded-full border bg-white/80">
            <ArrowLeftRight />
          </button>

          <div className="flex-1">
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full rounded-lg bg-white/80 backdrop-blur-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* TEXT AREAS */}
        <motion.div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[220px] rounded-xl bg-white/80 backdrop-blur-md"
            />
          </div>

          <div className="relative">
            <Textarea
              value={isTranslating ? "" : translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className="min-h-[220px] rounded-xl bg-white/80 backdrop-blur-md"
            />

            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* BUTTON */}
        <motion.div className="flex justify-center">
          <Button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            size="lg"
            className="rounded-full px-10 py-5 bg-gradient-to-r from-orange-400 to-green-500 text-white"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
