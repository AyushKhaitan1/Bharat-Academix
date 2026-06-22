import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Languages, RotateCcw } from 'lucide-react';

interface BhashaPlayerProps {
  onTranslatedText: (text: string) => void;
}

const REGIONAL_LANGUAGES = [
  { code: 'Hindi', label: 'Hindi (हिन्दी)', voiceLang: 'hi-IN' },
  { code: 'Tamil', label: 'Tamil (தமிழ்)', voiceLang: 'ta-IN' },
  { code: 'Telugu', label: 'Telugu (తెలుగు)', voiceLang: 'te-IN' },
  { code: 'Bengali', label: 'Bengali (বাংলা)', voiceLang: 'bn-IN' },
  { code: 'Marathi', label: 'Marathi (मराठी)', voiceLang: 'mr-IN' },
  { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', voiceLang: 'kn-IN' },
];

const DEMO_LECTURE_PAGES = [
  "Hello students. Today we are going to explore the beautiful process of photosynthesis. As you know, photosynthesis is the chemical reaction where plants synthesize glucose from light energy, water and carbon dioxide.",
  "This occurs primarily within the chloroplasts. There are two major stages: the light-dependent reactions in the thylakoid, and the Calvin cycle, which is the light-independent reactions occurring in the stroma.",
  "In the light reactions, chlorophyll molecules absorb photons, which energizes electrons. These high-energy electrons travel down an electron transport chain, creating ATP and NADPH, and splitting water to release oxygen.",
  "In the stroma, the Calvin cycle utilizes these carrier molecules. The enzyme RuBisCO facilitates carbon fixation, binding carbon dioxide to RuBP, which undergoes reduction to form glyceraldehyde 3-phosphate.",
  "Finally, these three-carbon sugars are combined to assemble glucose, which serves as the chemical food storage for the plant's biological activities."
];

export const BhashaPlayer: React.FC<BhashaPlayerProps> = ({ onTranslatedText }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(REGIONAL_LANGUAGES[0]);
  const [transcriptText, setTranscriptText] = useState<string[]>([]);
  const [translatedText, setTranslatedText] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Synthesis & Load Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      const updateVoices = () => {
        if (synthRef.current) {
          setVoices(synthRef.current.getVoices());
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll transcript panels
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptText, translatedText]);

  // Translate API handler
  const translateText = async (text: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': localStorage.getItem('GEMINI_API_KEY') || ''
        },
        body: JSON.stringify({ text, targetLanguage: selectedLanguage.code })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Translation API returned an error");
      }
      if (data.translatedText) {
        setTranslatedText(prev => [...prev, data.translatedText]);
        onTranslatedText(data.translatedText);
        
        // Auto-play TTS if auto-speak is enabled
        if (autoSpeakEnabled) {
          speakText(data.translatedText);
        }
      }
    } catch (err) {
      console.error("Translation api call failed:", err);
      // Fallback local translation label
      const fallback = `[Translated to ${selectedLanguage.code}]: ${text}`;
      setTranslatedText(prev => [...prev, fallback]);
      onTranslatedText(fallback);
      // If auto-play TTS is enabled, read the fallback text
      if (autoSpeakEnabled) {
        speakText(fallback);
      }
    }
  };

  // Speak translation aloud using SpeechSynthesis
  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    try {
      synthRef.current.cancel(); // Stop current speech
    } catch (e) {
      console.warn("Speech synthesis cancel failed:", e);
    }

    // Clean text from bracket prefix or mock labels
    const cleanText = text.replace(/\[.*?\]\s*:\s*/, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLanguage.voiceLang;
    utterance.volume = 1.0; // Force full volume
    utterance.rate = 0.95;  // Slightly slower for better classroom clarity
    utterance.pitch = 1.0;

    // Try to find native Indian voice matching target language from state
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(selectedLanguage.voiceLang.toLowerCase()));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      // Direct lookup fallback from API
      const directVoices = synthRef.current.getVoices();
      const directMatch = directVoices.find(v => v.lang.toLowerCase().startsWith(selectedLanguage.voiceLang.toLowerCase()));
      if (directMatch) {
        utterance.voice = directMatch;
      }
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsSpeaking(false);
    };

    // Use a small timeout to prevent browser audio queue collision/lockup in Chrome/Edge
    setTimeout(() => {
      if (synthRef.current) {
        setIsSpeaking(true);
        synthRef.current.speak(utterance);
      }
    }, 100);
  };

  // Microphone capture loop
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Microphone recognition not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isPlayingDemo) {
      setIsPlayingDemo(false);
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN';

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = async (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscriptText(prev => [...prev, resultText]);
      await translateText(resultText);
    };

    rec.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    rec.start();
    recognitionRef.current = rec;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Demo Lecture streaming simulation
  useEffect(() => {
    if (!isPlayingDemo) return;

    if (demoIndex >= DEMO_LECTURE_PAGES.length) {
      setIsPlayingDemo(false);
      setDemoIndex(0);
      return;
    }

    const interval = setTimeout(async () => {
      const currentSentence = DEMO_LECTURE_PAGES[demoIndex];
      setTranscriptText(prev => [...prev, currentSentence]);
      await translateText(currentSentence);
      setDemoIndex(prev => prev + 1);
    }, 6000); // Trigger a sentence every 6 seconds

    return () => clearTimeout(interval);
  }, [isPlayingDemo, demoIndex]);

  const toggleDemo = () => {
    if (isPlayingDemo) {
      setIsPlayingDemo(false);
    } else {
      if (isRecording) stopRecording();
      setIsPlayingDemo(true);
    }
  };

  const resetAll = () => {
    setIsPlayingDemo(false);
    setIsRecording(false);
    setDemoIndex(0);
    setTranscriptText([]);
    setTranslatedText([]);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setAutoSpeakEnabled(false);
  };

  return (
    <div className="glass-panel border border-emerald-500/20 rounded-3xl p-5 text-white flex flex-col gap-4 glow-pulse h-full min-h-[400px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Languages className="text-emerald-400" />
            BhashaTranslate Live Hub
          </h2>
          <p className="text-xs text-slate-400">Classroom transcription & regional translation</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Target language selector */}
          <select
            value={selectedLanguage.code}
            onChange={(e) => {
              const lang = REGIONAL_LANGUAGES.find(l => l.code === e.target.value);
              if (lang) {
                setSelectedLanguage(lang);
                // Clear translations to refresh language
                setTranslatedText([]);
              }
            }}
            className="bg-[#0b172a] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            {REGIONAL_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            onClick={resetAll}
            title="Reset transcript"
            className="p-1.5 rounded-xl border border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 transition-all active:scale-95"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Transcription viewports (Double Panel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[220px] overflow-y-auto pr-1">
        {/* Panel 1: English Transcript Ingest */}
        <div className="bg-[#081121] border border-white/5 rounded-2xl p-4 flex flex-col h-[280px]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-2 block">
            Original English Feed
          </span>
          <div className="flex-1 overflow-y-auto space-y-2 text-sm text-slate-300 scroll-smooth">
            {transcriptText.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Awaiting classroom audio feed...
              </div>
            ) : (
              transcriptText.map((text, i) => (
                <div key={i} className="bg-white/5 border-l-2 border-emerald-500/40 px-3 py-2 rounded-r-lg animate-in fade-in duration-300">
                  {text}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Panel 2: Live Vernacular Output */}
        <div className="bg-[#081121] border border-white/5 rounded-2xl p-4 flex flex-col h-[280px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Vernacular translation ({selectedLanguage.code})
            </span>
            <button
              onClick={() => {
                if (translatedText.length > 0) {
                  speakText(translatedText[translatedText.length - 1]);
                }
              }}
              disabled={translatedText.length === 0}
              className={`p-1 rounded hover:bg-white/5 ${
                isSpeaking ? 'text-emerald-400 animate-bounce' : 'text-slate-400 hover:text-emerald-400'
              } disabled:opacity-30`}
              title="Speak translation"
            >
              {isSpeaking ? <Volume2 size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-sm text-emerald-100 scroll-smooth font-medium">
            {translatedText.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Translation stream will populate here...
              </div>
            ) : (
              translatedText.map((text, i) => (
                <div key={i} className="bg-emerald-500/5 border-l-2 border-emerald-500 px-3 py-2 rounded-r-lg animate-in fade-in duration-300">
                  {text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3 justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          {/* Real Audio Capture */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <MicOff size={14} className="animate-pulse" />
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-lg cursor-pointer hover:shadow-emerald-900/30"
            >
              <Mic size={14} />
              Record Mic
            </button>
          )}

          {/* Demo Lecture Stream */}
          <button
            onClick={toggleDemo}
            className={`flex items-center gap-2 px-4 py-2 border text-xs font-semibold rounded-xl active:scale-95 transition-all cursor-pointer ${
              isPlayingDemo
                ? 'bg-amber-600 border-amber-500 hover:bg-amber-500 text-white'
                : 'border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400'
            }`}
          >
            {isPlayingDemo ? <Pause size={14} /> : <Play size={14} />}
            {isPlayingDemo ? 'Pause Demo Lecture' : 'Stream Demo Lecture'}
          </button>
        </div>

        {/* Text to Speech Toggle */}
        <button
          onClick={() => {
            const next = !autoSpeakEnabled;
            setAutoSpeakEnabled(next);
            if (!next && synthRef.current) {
              synthRef.current.cancel();
              setIsSpeaking(false);
            } else if (next && translatedText.length > 0) {
              speakText(translatedText[translatedText.length - 1]);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            autoSpeakEnabled
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse'
              : 'border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isSpeaking ? <Volume2 size={13} /> : <VolumeX size={13} />}
          Auto-Speak (TTS)
        </button>
      </div>
    </div>
  );
};
