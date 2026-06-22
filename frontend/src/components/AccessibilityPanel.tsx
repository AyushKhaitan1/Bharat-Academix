import React, { useState, useEffect } from 'react';
import { Eye, Type, Compass, Volume2, Sparkles } from 'lucide-react';

interface AccessibilityPanelProps {
  dyslexiaMode: boolean;
  setDyslexiaMode: (val: boolean) => void;
  adhdMode: boolean;
  setAdhdMode: (val: boolean) => void;
  colorblindTheme: string;
  setColorblindTheme: (val: string) => void;
  voiceNavActive: boolean;
  setVoiceNavActive: (val: boolean) => void;
  executeVoiceCommand: (cmd: string) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  dyslexiaMode,
  setDyslexiaMode,
  adhdMode,
  setAdhdMode,
  colorblindTheme,
  setColorblindTheme,
  voiceNavActive,
  setVoiceNavActive,
  executeVoiceCommand,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rulerTop, setRulerTop] = useState(0);

  // ADHD Focus Ruler Mouse Movement tracking
  useEffect(() => {
    if (!adhdMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setRulerTop(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [adhdMode]);

  // Voice Navigation setup
  useEffect(() => {
    if (!voiceNavActive) return;

    // Check browser SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Please use Chrome or Edge.");
      setVoiceNavActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Indian-English or en-US

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript.trim().toLowerCase();
      console.log("[Voice Command Detected]:", transcript);
      executeVoiceCommand(transcript);
    };

    recognition.onerror = (e: any) => {
      console.error("[Voice Navigation Error]:", e);
    };

    recognition.onend = () => {
      // Auto-restart if voice nav is still supposed to be active
      if (voiceNavActive) {
        try {
          recognition.start();
        } catch (err) {
          console.warn("Failed to restart voice recognition:", err);
        }
      }
    };

    recognition.start();

    return () => {
      recognition.abort();
    };
  }, [voiceNavActive]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* SVG Colorblind filters injected in page DOM */}
      <svg className="hidden">
        <defs>
          {/* Protanopia color blindness simulation filter */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                      0.558, 0.442, 0,     0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
          {/* Deuteranopia color blindness simulation filter */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                      0.70,  0.30,  0,   0, 0
                      0,     0.30,  0.70,0, 0
                      0,     0,     0,   1, 0"
            />
          </filter>
          {/* Tritanopia color blindness simulation filter */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95,  0.05,  0,     0, 0
                      0,     0.433, 0.567, 0, 0
                      0,     0.475, 0.525, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* ADHD Mode Overlays */}
      {adhdMode && (
        <>
          <div className="adhd-dimmer-top" style={{ height: `${rulerTop - 24}px` }} />
          <div className="adhd-focus-ruler" style={{ top: `${rulerTop}px` }} />
          <div className="adhd-dimmer-bottom" style={{ top: `${rulerTop + 24}px` }} />
        </>
      )}

      {/* Floating Panel Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
        {isOpen && (
          <div className="mb-3 w-80 glass-panel border border-emerald-500/30 rounded-2xl p-4 shadow-2xl glow-pulse text-white flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-2">
                <Sparkles size={18} />
                EduAccess Accessibility Hub
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                Active
              </span>
            </div>

            {/* Dyslexia Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Type size={16} className="text-emerald-400" />
                  Dyslexia Font Mode
                </span>
                <span className="text-[11px] text-slate-400">High-readability layout & spacing</span>
              </div>
              <button
                onClick={() => setDyslexiaMode(!dyslexiaMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  dyslexiaMode ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    dyslexiaMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* ADHD Focus Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Compass size={16} className="text-emerald-400" />
                  ADHD Focus Mode
                </span>
                <span className="text-[11px] text-slate-400">Screen focus ruler and dimming</span>
              </div>
              <button
                onClick={() => setAdhdMode(!adhdMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  adhdMode ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    adhdMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Command Recognition Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Volume2 size={16} className="text-emerald-400" />
                  Voice Commands
                </span>
                <span className="text-[11px] text-slate-400">Speak "open quiz", "show mind map" etc.</span>
              </div>
              <button
                onClick={() => setVoiceNavActive(!voiceNavActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  voiceNavActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    voiceNavActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Color Blind / High Contrast Theme Select */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium flex items-center gap-2">
                <Eye size={16} className="text-emerald-400" />
                Contrast & Color Filters
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { id: 'normal', name: 'Normal Theme' },
                  { id: 'high-contrast', name: 'High Contrast' },
                  { id: 'protanopia', name: 'Protanopia (Red)' },
                  { id: 'deuteranopia', name: 'Deuteranopia (Green)' },
                  { id: 'tritanopia', name: 'Tritanopia (Blue)' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorblindTheme(theme.id)}
                    className={`py-1.5 px-2 rounded-lg border transition-all ${
                      colorblindTheme === theme.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-white font-semibold'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {voiceNavActive && (
              <div className="mt-1 bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2"></span>
                Listening... Try saying: <br />
                <span className="text-white">"show quiz" | "open mind map" | "explain photosyn"</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleOpen}
          aria-label="Accessibility panel"
          className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-950/50 cursor-pointer border border-emerald-300/30 transition-transform active:scale-95 glow-emerald"
        >
          <Sparkles size={24} className={isOpen ? 'rotate-45 transition-transform duration-200' : 'transition-transform duration-200'} />
        </button>
      </div>
    </>
  );
};
