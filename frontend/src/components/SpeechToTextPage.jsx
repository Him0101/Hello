// import { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { Mic, Square, Copy, Check, Trash2 } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

// const LANGUAGES = [
//   { code: "en-IN", label: "English" },
//   { code: "hi-IN", label: "Hindi" },
//   { code: "mr-IN", label: "Marathi" },
//   { code: "gu-IN", label: "Gujarati" },
//   { code: "bn-IN", label: "Bengali" },
//   { code: "kn-IN", label: "Kannada" },
//   { code: "ml-IN", label: "Malayalam" },
// ];

// export default function SpeechToTextPage() {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [interimText, setInterimText] = useState("");
//   const [language, setLanguage] = useState("hi-IN");
//   const [copied, setCopied] = useState(false);
//   const recognitionRef = useRef(null);

//   const startListening = () => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) { alert("Speech recognition not supported. Use Chrome or Edge."); return; }
//     const r = new SR();
//     r.lang = language;
//     r.interimResults = true;
//     r.continuous = true;
//     r.onresult = (e) => {
//       let final = "", interim = "";
//       for (let i = 0; i < e.results.length; i++) {
//         if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
//         else interim += e.results[i][0].transcript;
//       }
//       if (final) setTranscript((p) => p + final);
//       setInterimText(interim);
//     };
//     r.onend = () => { setIsListening(false); setInterimText(""); };
//     r.onerror = () => { setIsListening(false); setInterimText(""); };
//     recognitionRef.current = r;
//     r.start();
//     setIsListening(true);
//   };

//   const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); setInterimText(""); };

//   return (
//     <div className="h-full overflow-y-auto" data-testid="speech-to-text-page">
//       <div className="max-w-3xl mx-auto px-5 md:px-10 py-6">
//         {/* Header */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900">Speech to Text</h1>
//             <p className="font-body text-[11px] text-zinc-400 mt-0.5">Transcribe speech and get transcripts</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <img src={LOGO_URL} alt="" className="h-7 w-7 object-contain" />
//             <span className="font-heading text-[13px] font-semibold text-zinc-900">Sarvbhasa</span>
//           </div>
//         </motion.div>

//         {/* Language */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
//           <label className="text-[10px] font-body font-semibold text-india-green uppercase tracking-wider mb-1 block">Recognition Language</label>
//           <Select value={language} onValueChange={setLanguage}>
//             <SelectTrigger className="w-[180px] rounded-lg border-zinc-200 bg-zinc-50 font-body text-[13px]" data-testid="speech-language-select">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
//           </Select>
//         </motion.div>

//         {/* Mic */}
//         <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col items-center mb-8">
//           <div className="relative mb-4">
//             {isListening && <div className="absolute inset-0 rounded-full animate-ping bg-red-200 opacity-40" />}
//             <button data-testid="speech-mic-btn" onClick={isListening ? stopListening : startListening}
//               className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
//                 isListening ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200" : "bg-gradient-to-br from-saffron to-india-green hover:opacity-90 shadow-lg"
//               }`}>
//               {isListening ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7 text-white" />}
//             </button>
//           </div>
//           <p className="font-body text-[13px] font-medium text-zinc-500">
//             {isListening ? (
//               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Listening... Click to stop</span>
//             ) : "Start Speaking"}
//           </p>
//         </motion.div>

//         {/* Transcript */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="font-heading text-[13px] font-semibold text-zinc-900">Transcript</h2>
//             <div className="flex gap-1">
//               <button onClick={() => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
//                 disabled={!transcript} className="p-1 rounded hover:bg-zinc-100 transition-colors disabled:opacity-30" data-testid="speech-copy-btn">
//                 {copied ? <Check className="w-3.5 h-3.5 text-india-green" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
//               </button>
//               <button onClick={() => { setTranscript(""); setInterimText(""); }} disabled={!transcript}
//                 className="p-1 rounded hover:bg-zinc-100 transition-colors disabled:opacity-30" data-testid="speech-clear-btn">
//                 <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
//               </button>
//             </div>
//           </div>
//           <div className="min-h-[180px] rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-body text-[13px] text-zinc-700 leading-relaxed" data-testid="speech-transcript-area">
//             {transcript || interimText ? (
//               <>{transcript}{interimText && <span className="text-zinc-400 italic">{interimText}</span>}</>
//             ) : (
//               <span className="text-zinc-300">Your transcript will appear here...</span>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }





// import { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { Mic, Square, Copy, Check, Trash2 } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const LOGO_URL = "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

// const LANGUAGES = [
//   { code: "en-IN", label: "English" },
//   { code: "hi-IN", label: "Hindi" },
//   { code: "mr-IN", label: "Marathi" },
//   { code: "gu-IN", label: "Gujarati" },
//   { code: "bn-IN", label: "Bengali" },
//   { code: "kn-IN", label: "Kannada" },
//   { code: "ml-IN", label: "Malayalam" },
// ];

// export default function SpeechToTextPage() {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [interimText, setInterimText] = useState("");
//   const [language, setLanguage] = useState("hi-IN");
//   const [copied, setCopied] = useState(false);
//   const [loading] = useState(false);

//   const recognitionRef = useRef(null);
//   const shouldListenRef = useRef(false);

//   const startListening = async () => {
//     alert("MIC BUTTON CLICKED");
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SR) {
//       alert("Speech Recognition not supported. Use Google Chrome.");
//       return;
//     }

//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true });
//     } catch (err) {
//       console.error("Mic permission error:", err);
//       alert("Please allow microphone permission.");
//       return;
//     }

//     try {
//       shouldListenRef.current = true;

//       const recognition = new SR();
//       recognition.lang = language;
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.maxAlternatives = 1;

//       recognition.onstart = () => {
//         console.log("🎤 Speech recognition started");
//         setIsListening(true);
//       };

//       recognition.onresult = (event) => {
//         let finalText = "";
//         let interim = "";

//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const text = event.results[i][0].transcript;

//           if (event.results[i].isFinal) {
//             finalText += text + " ";
//           } else {
//             interim += text;
//           }
//         }

//         if (finalText.trim()) {
//           setTranscript((prev) => prev + " " + finalText.trim());
//         }

//         setInterimText(interim);
//       };

//       recognition.onerror = (event) => {
//         console.error("Speech error:", event.error);

//         if (event.error === "not-allowed") {
//           alert("Microphone permission denied.");
//           shouldListenRef.current = false;
//           setIsListening(false);
//         }

//         if (event.error === "no-speech") {
//           console.log("No speech detected, keep speaking...");
//         }
//       };

//       recognition.onend = () => {
//         console.log("🛑 Speech recognition ended");

//         if (shouldListenRef.current) {
//           try {
//             recognition.start();
//           } catch (err) {
//             console.log("Restart skipped:", err);
//           }
//         } else {
//           setIsListening(false);
//           setInterimText("");
//         }
//       };

//       recognitionRef.current = recognition;
//       recognition.start();

//     } catch (err) {
//       console.error("Start recognition failed:", err);
//       alert("Could not start speech recognition. Refresh page and try again.");
//     }
//   };

//   const stopListening = () => {
//     shouldListenRef.current = false;

//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (err) {
//         console.log("Stop skipped:", err);
//       }
//     }

//     setIsListening(false);
//     setInterimText("");
//   };

//   return (
//     <div className="wavy-tricolor-bg min-h-screen relative overflow-y-auto">
//       <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-10 py-6">
        
//         {/* Header */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-xl font-bold text-zinc-900">Speech to Text</h1>
//             <p className="text-sm text-zinc-500">Powered by Sarvam AI</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <img src={LOGO_URL} alt="" className="h-7 w-7" />
//             <span className="font-semibold">Sarvbhasa</span>
//           </div>
//         </motion.div>

//         {/* Language Selection */}
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
//           <label className="text-xs font-semibold text-green-600 mb-1 block">Language</label>
//           <Select value={language} onValueChange={setLanguage}>
//             <SelectTrigger className="w-[180px] rounded-lg bg-white/80 backdrop-blur-md">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {LANGUAGES.map((l) => (
//                 <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </motion.div>

//         {/* Mic Controls */}
//         <motion.div className="flex flex-col items-center mb-8">
//           <div className="relative mb-4">
//             {isListening && (
//               <div className="absolute inset-0 rounded-full animate-ping bg-red-200 opacity-40" />
//             )}
//             <button
//               onClick={isListening ? stopListening : startListening}
//               disabled={loading}
//               className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
//                 isListening ? "bg-red-500" : "bg-gradient-to-br from-orange-400 to-green-500"
//               } ${loading ? "opacity-50 cursor-not-allowed" : "shadow-lg"}`}
//             >
//               {isListening ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7 text-white" />}
//             </button>
//           </div>
//           <p className="text-sm text-zinc-600">
//             {loading ? "Processing audio..." : isListening ? "Listening... Click to stop" : "Start Speaking"}
//           </p>
//         </motion.div>

//         {/* Transcript Output */}
//         <motion.div>
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="text-sm font-semibold text-zinc-900">Transcript</h2>
//             <div className="flex gap-1">
//               <button 
//                 onClick={() => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
//                 className="p-1 rounded hover:bg-white/60"
//               >
//                 {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-zinc-500" />}
//               </button>
//               <button onClick={() => { setTranscript(""); setInterimText(""); }} className="p-1 rounded hover:bg-white/60">
//                 <Trash2 className="w-4 h-4 text-zinc-500" />
//               </button>
//             </div>
//           </div>

//           <div className="min-h-[180px] rounded-xl bg-white/80 backdrop-blur-md p-4 text-sm text-zinc-700">
//             {transcript || interimText ? (
//               <>
//                 {transcript}
//                 {interimText && <span className="text-zinc-400 italic"> {interimText}</span>}
//               </>
//             ) : (
//               <span className="text-zinc-400 italic">Your transcript will appear here after you stop speaking...</span>
//             )}
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Copy, Check, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_india-ai-platform-2/artifacts/3x5chxm4_Multilingual.png";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "bn-IN", label: "Bengali" },
  { code: "kn-IN", label: "Kannada" },
  { code: "ml-IN", label: "Malayalam" },
];

export default function SpeechToTextPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState("hi-IN");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    return () => cleanupRecorder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    setSeconds(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(diff);
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const getBestMimeType = () => {
    if (!window.MediaRecorder) return "";

    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }

    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return "audio/webm";
    }

    if (MediaRecorder.isTypeSupported("video/webm;codecs=opus")) {
      return "video/webm;codecs=opus";
    }

    if (MediaRecorder.isTypeSupported("video/webm")) {
      return "video/webm";
    }

    return "";
  };

  const startListening = async () => {
    try {
      setInterimText("");
      setLoading(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone is not supported. Use Chrome.");
        return;
      }

      if (!window.MediaRecorder) {
        alert("MediaRecorder not supported. Use Chrome.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getBestMimeType();

      const options = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstart = () => {
        console.log("🎤 Recording started");
        console.log("🎧 MediaRecorder MIME:", mediaRecorder.mimeType);

        setIsListening(true);
        setLoading(false);
        setInterimText("Recording... speak clearly.");
        startTimer();
      };

      mediaRecorder.ondataavailable = (event) => {
        console.log("📦 Chunk size:", event.data.size);

        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("❌ MediaRecorder error:", event.error);
        alert("Recording failed. Refresh page and allow microphone.");
        cleanupRecorder();
      };

      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped");

        stopTimer();
        setIsListening(false);
        setLoading(true);
        setInterimText("Processing audio with Sarvbhasa...");

        try {
          const finalMimeType =
            mediaRecorder.mimeType || mimeType || "audio/webm";

          const audioBlob = new Blob(chunksRef.current, {
            type: finalMimeType,
          });

          console.log("📦 Total chunks:", chunksRef.current.length);
          console.log("📦 Final audio size:", audioBlob.size);
          console.log("🎧 Final audio type:", audioBlob.type);

          if (audioBlob.size < 1000) {
            setInterimText("");
            alert(
              "Audio is too small. Mic did not capture properly. Current size: " +
                audioBlob.size +
                " bytes"
            );
            return;
          }

          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          formData.append("language", language);

          console.log("🚀 Calling backend STT API:", `${API}/speech-to-text`);

          const res = await fetch(`${API}/speech-to-text`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("🧠 STT frontend response:", data);

          if (data.text && data.text.trim()) {
            setTranscript((prev) => {
              const oldText = prev.trim();
              const newText = data.text.trim();
              return oldText ? `${oldText} ${newText}` : newText;
            });
            setInterimText("");
          } else {
            setInterimText("");
            alert(
              data.error ||
                "No transcript received. Your mic audio may be silent."
            );
          }
        } catch (err) {
          console.error("❌ STT fetch error:", err);
          setInterimText("");
          alert(err.message || "Speech to text failed.");
        } finally {
          setLoading(false);
          cleanupStream();
          chunksRef.current = [];
        }
      };

      mediaRecorder.start(1000);
    } catch (err) {
      console.error("❌ Mic start error:", err);
      alert("Please allow microphone permission and try again.");
      cleanupRecorder();
    }
  };

  const stopListening = () => {
    try {
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
      }
    } catch (err) {
      console.log("Stop skipped:", err);
      cleanupRecorder();
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const cleanupRecorder = () => {
    stopTimer();
    cleanupStream();

    setIsListening(false);
    setLoading(false);
    setInterimText("");

    mediaRecorderRef.current = null;
    chunksRef.current = [];
  };

  return (
    <div className="wavy-tricolor-bg min-h-screen relative overflow-y-auto">
      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Speech to Text</h1>
            <p className="text-sm text-zinc-500">Powered by Sarvam AI</p>
          </div>

          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7" />
            <span className="font-semibold">Sarvbhasa</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="text-xs font-semibold text-green-600 mb-1 block">
            Language
          </label>

          <Select
            value={language}
            onValueChange={(value) => {
              if (!isListening && !loading) setLanguage(value);
            }}
          >
            <SelectTrigger className="w-[180px] rounded-lg bg-white/80 backdrop-blur-md">
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
        </motion.div>

        <motion.div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {isListening && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-200 opacity-40" />
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500"
                  : "bg-gradient-to-br from-orange-400 to-green-500"
              } ${loading ? "opacity-50 cursor-not-allowed" : "shadow-lg"}`}
            >
              {isListening ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>
          </div>

          <p className="text-sm text-zinc-600">
            {loading
              ? "Processing audio..."
              : isListening
              ? `Recording... ${seconds}s`
              : "Start Speaking"}
          </p>
        </motion.div>

        <motion.div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-900">Transcript</h2>

            <div className="flex gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcript);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1 rounded hover:bg-white/60"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              <button
                onClick={() => {
                  setTranscript("");
                  setInterimText("");
                }}
                className="p-1 rounded hover:bg-white/60"
              >
                <Trash2 className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="min-h-[180px] rounded-xl bg-white/80 backdrop-blur-md p-4 text-sm text-zinc-700">
            {transcript || interimText ? (
              <>
                {transcript}
                {interimText && (
                  <span className="text-zinc-400 italic"> {interimText}</span>
                )}
              </>
            ) : (
              <span className="text-zinc-400 italic">
                Your transcript will appear here after you stop speaking...
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}