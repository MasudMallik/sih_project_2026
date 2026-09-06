import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type PropsWithChildren,
} from "react";
import { Send, Mic, X, Keyboard, ArrowLeft, Trash2, MicOff } from "lucide-react";
import { sendChatMessage } from "../services/chat.service";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { getCurrentUser } from "../services/auth.service";

/* ============================================================================
   BRAND TOKENS
============================================================================ */
const BRAND = {
  forest: "#16241C",
  forestLight: "#1E332A",
  forestLine: "#2C4237",
  cream: "#F3EEE3",
  creamDim: "#EAE2D0",
  ink: "#1B241D",
  inkSoft: "#4A5750",
  amber: "#DE9A3F",
  amberDeep: "#B9762A",
  amberSoft: "#F0C888",
};

/* ============================================================================
   CHAT CONTEXT
============================================================================ */
type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  viaVoice?: boolean;
};

type ChatContextValue = {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  sendUserMessage: (text: string, viaVoice?: boolean) => Promise<string | null>;
  clearChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);
function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
}

const HIGHLIGHT_TERMS = [
  "Teesta",
  "Chungthang",
  "Lachen",
  "Melli",
  "Rangpo",
  "NH10",
  "Moderate",
  "High",
];

function highlightCaption(text: string) {
  const pattern = new RegExp(`(${HIGHLIGHT_TERMS.join("|")})`, "g");
  return text.split(pattern).map((chunk: string, i: number) =>
    HIGHLIGHT_TERMS.includes(chunk) ? (
      <span key={i} style={{ color: "#E3AEFF" }}>
        {chunk}
      </span>
    ) : (
      <React.Fragment key={i}>{chunk}</React.Fragment>
    )
  );
}

function ChatProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendUserMessage = useCallback(async (text: string, viaVoice = false) => {
    if (!text.trim()) return null;
    setError(null);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "user", text, viaVoice }]);
    setIsTyping(true);
    try {
      const reply = await sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "ai", text: reply, viaVoice },
      ]);
      return reply;
    } catch (requestError) {
      const msg = requestError instanceof Error ? requestError.message : "Unable to contact the assistant.";
      setError(msg);
      return null;
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setIsTyping(false);
    setError(null);
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, isTyping, error, sendUserMessage, clearChat }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/* ============================================================================
   VOICE ORB
============================================================================ */
type VoiceOrbProps = {
  size?: number;
  state?: "idle" | "listening" | "processing" | "speaking";
  showIcon?: boolean;
};

function VoiceOrb({ size = 120, state = "idle", showIcon = false }: VoiceOrbProps) {
  const orbStyle = { "--vo-size": `${size}px` } as CSSProperties;

  return (
    <div className="vo-orb" data-state={state} style={orbStyle}>
      <span className="vo-wave vo-wave-a" />
      <span className="vo-wave vo-wave-b" />
      <span className="vo-ring" />
      <span className="vo-sphere">
        <span className="vo-rotor">
          <span className="vo-blob vo-blob-violet" />
          <span className="vo-blob vo-blob-pink" />
          <span className="vo-blob vo-blob-amber" />
        </span>
        <span className="vo-core" />
      </span>
      {showIcon && (
        <span className="vo-icon">
          {state === "listening" ? (
            <Mic size={Math.round(size * 0.3)} strokeWidth={1.8} className="animate-pulse" />
          ) : (
            <Mic size={Math.round(size * 0.3)} strokeWidth={1.8} />
          )}
        </span>
      )}
    </div>
  );
}

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/* ============================================================================
   VOICE POPUP - Full-screen modal with complete lifecycle management
============================================================================ */
function VoicePopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sendUserMessage } = useChat();
  const [status, setStatus] = useState<VoiceOrbProps["state"]>("idle");
  const [caption, setCaption] = useState(
    "Ask me about a village, a route, or a river — I'm listening."
  );
  const [micDenied, setMicDenied] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isStoppingRef = useRef(false);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const stopAudioStreams = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      activeStreamRef.current = null;
    }
  }, []);

  const cleanUpSpeechRecognition = useCallback(() => {
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopAudioStreams();
  }, [stopAudioStreams]);

  const handleClose = useCallback(() => {
    clearAllTimers();
    cleanUpSpeechRecognition();
    setStatus("idle");
    onClose();
  }, [cleanUpSpeechRecognition, onClose]);

  const startListening = useCallback(() => {
    clearAllTimers();
    cleanUpSpeechRecognition();
    setMicDenied(false);
    isStoppingRef.current = false;

    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("idle");
      setCaption("Voice recognition is not supported by your browser. Please use typed input.");
      return;
    }

    // Request mic stream to ensure permission state and stream track lifecycle
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        activeStreamRef.current = stream;
        try {
          const instance = new SpeechRecognition();
          recognitionRef.current = instance;
          instance.continuous = false;
          instance.interimResults = false;
          instance.lang = "en-IN";

          instance.onresult = async (event) => {
            if (isStoppingRef.current) return;
            const transcript = event.results[0]?.[0]?.transcript.trim();
            cleanUpSpeechRecognition();

            if (!transcript) {
              setStatus("idle");
              setCaption("No voice detected. Tap microphone to try again.");
              return;
            }

            setStatus("processing");
            setCaption(`"${transcript}"`);

            try {
              const reply = await sendUserMessage(transcript, true);
              if (reply) {
                setStatus("speaking");
                setCaption(reply);
                timersRef.current.push(
                  setTimeout(() => {
                    setStatus("idle");
                  }, 4000)
                );
              } else {
                setStatus("idle");
                setCaption("Assistant response unavailable. Tap microphone to speak again.");
              }
            } catch {
              setStatus("idle");
              setCaption("Failed to fetch response. Check network connection.");
            }
          };

          instance.onerror = (evt) => {
            cleanUpSpeechRecognition();
            setStatus("idle");
            if (evt.error === "not-allowed" || evt.error === "permission-denied") {
              setMicDenied(true);
              setCaption("Microphone access was denied. Please allow microphone access in your browser settings.");
            } else if (evt.error === "no-speech") {
              setCaption("No speech detected. Tap orb to try speaking again.");
            } else {
              setCaption(`Voice error (${evt.error}). Tap orb to try again.`);
            }
          };

          instance.onend = () => {
            cleanUpSpeechRecognition();
            if (status === "listening") {
              setStatus("idle");
            }
          };

          instance.start();
          setStatus("listening");
          setCaption("Listening… speak now.");
        } catch {
          cleanUpSpeechRecognition();
          setStatus("idle");
          setCaption("Could not initialize speech recognition. Use text input.");
        }
      })
      .catch((err) => {
        setStatus("idle");
        setMicDenied(true);
        setCaption("Microphone permission denied or device unavailable.");
        console.error("Microphone permission error:", err);
      });
  }, [cleanUpSpeechRecognition, sendUserMessage, status]);

  const handleOrbTap = () => {
    if (status === "listening" || status === "processing" || status === "speaking") {
      clearAllTimers();
      cleanUpSpeechRecognition();
      setStatus("idle");
      setCaption("Paused — tap the orb to start speaking.");
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (open) {
      startListening();
    } else {
      clearAllTimers();
      cleanUpSpeechRecognition();
      setStatus("idle");
    }

    return () => {
      clearAllTimers();
      cleanUpSpeechRecognition();
    };
  }, [open, startListening, cleanUpSpeechRecognition]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-vo-pop" style={{ backgroundColor: "#0a0714" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, #4a1f7a 0%, #241241 40%, #0a0714 74%, #050309 100%)",
        }}
      />

      <div className="relative flex items-center justify-between px-5 pt-5 sm:pt-6">
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Close voice assistant"
        >
          <ArrowLeft size={18} style={{ color: BRAND.cream }} />
        </button>
        {micDenied && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <MicOff size={14} /> Mic Access Blocked
          </span>
        )}
      </div>

      <div className="relative flex-1 flex items-center justify-center px-9">
        <p
          key={caption}
          className="text-center text-[19px] sm:text-[21px] leading-relaxed max-w-sm animate-vo-caption"
          style={{ color: "rgba(240,232,250,0.94)" }}
        >
          {highlightCaption(caption)}
        </p>
      </div>

      <div className="relative flex items-center justify-center gap-9 pb-14 sm:pb-16">
        <button
          onClick={handleClose}
          className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)" }}
          aria-label="Switch back to typing"
          title="Switch to typing"
        >
          <Keyboard size={17} style={{ color: BRAND.cream }} />
        </button>

        <button
          onClick={handleOrbTap}
          className="outline-none focus:scale-105 transition-transform"
          aria-label={status === "idle" ? "Start listening" : "Pause listening"}
        >
          <VoiceOrb size={132} state={status} showIcon />
        </button>

        <button
          onClick={handleClose}
          className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-white/10"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)" }}
          aria-label="Close voice assistant"
          title="Close voice"
        >
          <X size={16} style={{ color: BRAND.cream }} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   CHAT UI
============================================================================ */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[82%]">
        <div
          className={`px-4 py-3 text-[13.5px] leading-relaxed ${
            isUser ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
          }`}
          style={{
            backgroundColor: isUser ? BRAND.amber : "#FFFFFF",
            color: isUser ? BRAND.forest : BRAND.ink,
            border: isUser ? "none" : "1px solid #E7DFCB",
          }}
        >
          {msg.text}
        </div>
        {msg.viaVoice && (
          <div
            className={`flex items-center gap-1 mt-1 text-[10.5px] ${isUser ? "justify-end" : ""}`}
            style={{ color: BRAND.inkSoft }}
          >
            <Mic size={10} />
            spoken
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7DFCB" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-vo-typing"
            style={{ backgroundColor: BRAND.amberDeep, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatSection() {
  const { messages, isTyping, error, sendUserMessage, clearChat } = useChat();
  const [draft, setDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clearArmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => () => {
    if (clearArmTimer.current) clearTimeout(clearArmTimer.current);
  }, []);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendUserMessage(draft.trim());
    setDraft("");
  };

  const handleClearClick = () => {
    if (confirmingClear) {
      if (clearArmTimer.current) clearTimeout(clearArmTimer.current);
      setConfirmingClear(false);
      clearChat();
      return;
    }
    setConfirmingClear(true);
    clearArmTimer.current = setTimeout(() => setConfirmingClear(false), 3000);
  };

  return (
    <section id="chat" className="flex-1 min-h-0 flex flex-col" style={{ backgroundColor: BRAND.cream }}>
      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto flex flex-col px-3 sm:px-6 py-3 sm:py-5">
        <div
          className="relative flex-1 min-h-0 rounded-3xl border overflow-hidden flex flex-col"
          style={{ borderColor: "#DED4BB", backgroundColor: BRAND.creamDim }}
        >
          <div
            className="flex items-center gap-3 px-5 py-4 border-b"
            style={{ backgroundColor: BRAND.forest, borderColor: BRAND.forestLine }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: BRAND.cream }}>
                Geo Rakshak Assistant
              </p>
              <p className="text-[11px] flex items-center gap-1.5" style={{ color: BRAND.amberSoft }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Watching your region in real time
              </p>
            </div>
            {confirmingClear && (
              <span className="text-[11px] whitespace-nowrap" style={{ color: BRAND.amberSoft }}>
                Tap again to clear
              </span>
            )}
            <button
              onClick={handleClearClick}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors"
              style={{
                color: confirmingClear ? BRAND.forest : BRAND.amberSoft,
                backgroundColor: confirmingClear ? BRAND.amber : "transparent",
              }}
              aria-label={confirmingClear ? "Confirm clear chat" : "Clear chat"}
              title={confirmingClear ? "Tap again to clear" : "Clear chat"}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {isTyping && <TypingIndicator />}
            {error && <p className="text-center text-xs text-red-700">{error}</p>}
          </div>

          <div className="relative p-3 border-t flex items-center gap-2" style={{ borderColor: "#DED4BB" }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about a village, river, or route…"
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none border"
              style={{ borderColor: "#DED4BB", backgroundColor: "#FFFDF8", color: BRAND.ink }}
            />
            <button
              onClick={() => setVoiceOpen(true)}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-transform hover:scale-105 active:scale-95"
              style={{ borderColor: "#DED4BB", backgroundColor: "#FFFDF8" }}
              aria-label="Ask by voice"
            >
              <Mic size={16} style={{ color: BRAND.amberDeep }} />
            </button>
            <button
              onClick={handleSend}
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: BRAND.amber }}
              aria-label="Send message"
            >
              <Send size={16} style={{ color: BRAND.forest }} />
            </button>
          </div>

          <VoicePopup open={voiceOpen} onClose={() => setVoiceOpen(false)} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   HEADER
============================================================================ */
function Nav() {
  const user = getCurrentUser();
  const currentUser = {
    id: user?.email || "user@georakshak.org",
    name: user?.name || "Citizen",
    role: "AI Assistant",
    avatar: user?.name ? user.name.slice(0, 2).toUpperCase() : "AI",
  };

  return <DashboardHeader user={currentUser} />;
}

/* ============================================================================
   APP
============================================================================ */
export default function App() {
  return (
    <ChatProvider>
      <style>{`
        @keyframes vo-typing {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        .animate-vo-typing { animation: vo-typing 1.1s infinite; }

        @keyframes vo-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-vo-pop { animation: vo-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1); }

        @keyframes vo-caption-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-vo-caption { animation: vo-caption-in 0.35s ease-out; }

        .vo-orb {
          position: relative;
          width: var(--vo-size);
          height: var(--vo-size);
          border-radius: 50%;
          isolation: isolate;
        }
        .vo-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid rgba(200,140,255,0.85);
          box-shadow: 0 0 20px rgba(200,120,255,0.4), 0 0 54px rgba(255,140,90,0.18),
            inset 0 0 18px rgba(200,120,255,0.14);
          transition: box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .vo-orb[data-state="listening"] .vo-ring {
          border-color: rgba(230,150,255,0.95);
          box-shadow: 0 0 30px rgba(230,130,255,0.55), 0 0 70px rgba(255,150,90,0.28),
            inset 0 0 22px rgba(230,130,255,0.2);
        }
        .vo-orb[data-state="processing"] .vo-ring {
          border-color: rgba(180,200,255,0.95);
          box-shadow: 0 0 26px rgba(160,190,255,0.5), 0 0 60px rgba(160,190,255,0.24),
            inset 0 0 18px rgba(160,190,255,0.16);
        }
        .vo-orb[data-state="speaking"] .vo-ring {
          border-color: rgba(255,180,120,0.95);
          box-shadow: 0 0 30px rgba(255,160,100,0.5), 0 0 70px rgba(255,140,80,0.24),
            inset 0 0 20px rgba(255,160,100,0.16);
        }

        .vo-wave {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1px solid rgba(220,150,255,0.5);
          opacity: 0;
          animation: vo-wave-out 3.2s ease-out infinite;
        }
        .vo-wave-b { animation-delay: 1.6s; }
        .vo-orb[data-state="listening"] .vo-wave { animation-duration: 2.2s; }
        .vo-orb[data-state="listening"] .vo-wave-b { animation-delay: 1.1s; }
        .vo-orb[data-state="processing"] .vo-wave { animation-duration: 1.4s; }
        .vo-orb[data-state="processing"] .vo-wave-b { animation-delay: 0.7s; }
        .vo-orb[data-state="speaking"] .vo-wave { animation-duration: 1.8s; }
        .vo-orb[data-state="speaking"] .vo-wave-b { animation-delay: 0.9s; }
        @keyframes vo-wave-out {
          0%   { transform: scale(0.94); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .vo-sphere {
          position: absolute; inset: 8%; border-radius: 50%; overflow: hidden;
          background: radial-gradient(circle at 48% 42%, #120A18 0%, #050308 78%);
        }
        .vo-rotor { position: absolute; inset: 0; animation: vo-spin 14s linear infinite; }
        .vo-orb[data-state="listening"] .vo-rotor { animation-duration: 5s; }
        .vo-orb[data-state="processing"] .vo-rotor { animation-duration: 2s; }
        .vo-orb[data-state="speaking"] .vo-rotor { animation-duration: 3.6s; }
        @keyframes vo-spin { to { rotate: 360deg; } }

        .vo-blob {
          position: absolute; width: 62%; height: 62%; top: 19%; left: 19%;
          filter: blur(9px); mix-blend-mode: screen; opacity: 0.85;
          border-radius: 42% 58% 55% 45% / 45% 42% 58% 55%;
          animation: vo-morph 7s ease-in-out infinite;
        }
        .vo-blob-violet { background: radial-gradient(circle, #c78bff 0%, #7c3aed 60%, transparent 75%); }
        .vo-blob-pink   { background: radial-gradient(circle, #ff9fe0 0%, #ec4899 60%, transparent 75%); translate: 11% -5%; animation-delay: -2.3s; }
        .vo-blob-amber  { background: radial-gradient(circle, #ffcf94 0%, #f97316 60%, transparent 75%); translate: -9% 7%; animation-delay: -4.6s; }
        @keyframes vo-morph {
          0%, 100% { border-radius: 42% 58% 55% 45% / 45% 42% 58% 55%; scale: 1; }
          33%      { border-radius: 58% 42% 45% 55% / 55% 45% 42% 58%; scale: 1.06; }
          66%      { border-radius: 50% 50% 62% 38% / 40% 62% 38% 60%; scale: 0.95; }
        }
        .vo-orb[data-state="listening"] .vo-blob { animation-duration: 2.4s; filter: blur(8px) brightness(1.1); opacity: 0.92; }
        .vo-orb[data-state="processing"] .vo-blob { animation-duration: 1.3s; filter: blur(7px) brightness(1.02); opacity: 0.85; }
        .vo-orb[data-state="speaking"] .vo-blob { animation-duration: 1.8s; filter: blur(8px) brightness(1.12); opacity: 0.92; }

        .vo-icon {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.92);
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          pointer-events: none;
        }

        .vo-core {
          position: absolute; width: 22%; height: 22%; top: 39%; left: 39%; border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.5) 45%, transparent 75%);
          filter: blur(1.5px); mix-blend-mode: screen;
          animation: vo-core-breathe 4.2s ease-in-out infinite;
        }
        .vo-orb[data-state="idle"] .vo-core { opacity: 0.55; }
        .vo-orb[data-state="listening"] .vo-core { animation: vo-core-breathe 1.4s ease-in-out infinite; }
        .vo-orb[data-state="processing"] .vo-core { animation: vo-core-think 0.85s ease-in-out infinite; }
        .vo-orb[data-state="speaking"] .vo-core { animation: vo-core-talk 0.5s ease-in-out infinite; }
        @keyframes vo-core-breathe { 0%, 100% { scale: 0.9; opacity: 0.75; } 50% { scale: 1.1; opacity: 1; } }
        @keyframes vo-core-think   { 0%, 100% { scale: 0.82; } 50% { scale: 1.08; } }
        @keyframes vo-core-talk    { 0%, 100% { scale: 0.88; } 25% { scale: 1.14; } 50% { scale: 0.95; } 75% { scale: 1.06; } }

        @media (prefers-reduced-motion: reduce) {
          .vo-rotor, .vo-blob, .vo-core, .vo-wave { animation: none !important; }
        }
      `}</style>

      <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: BRAND.cream }}>
        <Nav />
        <ChatSection />
      </div>
    </ChatProvider>
  );
}