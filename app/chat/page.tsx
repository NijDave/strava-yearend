"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What's my longest ever run?",
  "Build me a 10K training plan",
  "Compare my best months",
  "When do I train most?",
  "What activity am I best at?",
];

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-bold text-neon-orange">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="font-mono text-xs px-1.5 py-0.5"
          style={{ background: "rgba(255,85,0,0.15)", border: "1px solid rgba(255,85,0,0.3)", color: "#FF5500" }}>
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

function FormatMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    if (listType === "ul")
      elements.push(<ul key={key} className="ml-4 space-y-1 my-2 list-none">{listItems}</ul>);
    else
      elements.push(<ol key={key} className="ml-4 space-y-1 my-2 list-decimal">{listItems}</ol>);
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      flushList(`fl${i}`);
      elements.push(<h3 key={i} className="font-bebas text-lg text-neon-orange mt-3 mb-1 tracking-wider">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushList(`fl${i}`);
      elements.push(<h2 key={i} className="font-bebas text-xl text-neon-orange mt-3 mb-1 tracking-wider">{line.slice(3)}</h2>);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      if (listType !== "ul") { flushList(`fl${i}`); listType = "ul"; }
      listItems.push(
        <li key={i} className="text-sm leading-relaxed text-white/80 flex gap-2">
          <span className="text-neon-orange mt-0.5 flex-shrink-0">▸</span>
          <span>{formatInline(line.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      if (listType !== "ol") { flushList(`fl${i}`); listType = "ol"; }
      listItems.push(<li key={i} className="text-sm leading-relaxed text-white/80">{formatInline(line.replace(/^\d+\.\s/, ""))}</li>);
    } else if (line.trim() === "") {
      flushList(`fl${i}`);
      elements.push(<div key={i} className="h-1" />);
    } else {
      flushList(`fl${i}`);
      elements.push(<p key={i} className="text-sm leading-relaxed text-white/80">{formatInline(line)}</p>);
    }
  });
  flushList("final");
  return <div className="space-y-0.5">{elements}</div>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/ai/chat");
      const data = await res.json();
      if (data.history && data.history.length > 0) {
        setMessages(data.history.map((h: any) => ({ role: h.role, content: h.content })));
      } else {
        setMessages([{
          role: "assistant",
          content: "COACH SYSTEM ONLINE ⚡\n\nI have full access to your Strava training database. Fire away:\n* Training plans & periodization\n* Your best runs, rides & stats\n* Year-by-year performance trends\n* Pace targets & race predictions\n* General sports science questions",
        }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "COACH SYSTEM ONLINE ⚡ Ask me anything about your training!" }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (msgOverride?: string) => {
    const text = msgOverride || input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI. Make sure Ollama is running!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmpty = messages.length <= 1; // Only the initial greeting

  return (
    <div className="flex flex-col h-screen bg-cyber-black">
      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none fixed inset-0 z-0 opacity-30" />

      {/* ── HEADER ── */}
      <div className="relative z-10 flex items-center gap-4 px-4 sm:px-6 py-4"
        style={{
          background: "rgba(0,0,0,0.9)",
          borderBottom: "1px solid rgba(255,85,0,0.3)",
          borderLeft: "4px solid #FF5500",
        }}>
        <div>
          <div className="hud-label text-neon-orange/60 mb-0.5">// AI TRAINING SYSTEM</div>
          <div className="font-bebas text-3xl sm:text-4xl text-white tracking-widest">
            🤖 <span className="text-neon-orange">COACH</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-green-400/80 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "pulseRing 2s ease-out infinite" }} />
            ONLINE
          </div>
          <a href="/dashboard"
            className="font-mono text-xs text-white/60 hover:text-neon-orange transition-colors px-4 py-2 border border-white/20 hover:border-neon-orange/50">
            ← DASHBOARD
          </a>
        </div>
      </div>

      {/* ── MESSAGE AREA ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-3xl mx-auto w-full space-y-4">

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-2 border-neon-orange/30 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-neon-orange rounded-full animate-spin" />
              </div>
              <div className="font-mono text-xs text-white/40 uppercase tracking-widest">LOADING MISSION HISTORY...</div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 text-lg"
                    style={{ border: "1px solid rgba(255,85,0,0.4)", background: "rgba(255,85,0,0.1)" }}>
                    🤖
                  </div>
                )}

                {/* Bubble */}
                <div
                  className="max-w-[85%] sm:max-w-[78%] px-4 py-3"
                  style={msg.role === "user"
                    ? {
                        background: "#FF5500",
                        color: "#000",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,85,0,0.25)",
                        boxShadow: "0 0 20px rgba(255,85,0,0.04)",
                      }
                  }
                >
                  {msg.role === "assistant"
                    ? <FormatMessage text={msg.content} />
                    : <span className="text-sm">{msg.content}</span>}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 text-lg"
                    style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}>
                    👤
                  </div>
                )}
              </div>
            ))
          )}

          {/* Thinking dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-lg"
                style={{ border: "1px solid rgba(255,85,0,0.4)", background: "rgba(255,85,0,0.1)" }}>🤖</div>
              <div className="px-5 py-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,85,0,0.25)" }}>
                <div className="flex gap-2 items-center">
                  {[0, 150, 300].map((delay, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "#FF5500", boxShadow: "0 0 8px rgba(255,85,0,0.8)", animation: `bounce 0.8s ease-in-out infinite`, animationDelay: `${delay}ms` }} />
                  ))}
                  <span className="font-mono text-xs text-white/40 ml-2 uppercase tracking-widest">ANALYZING...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested prompts — shown only when conversation is fresh */}
          {isEmpty && !loading && !loadingHistory && (
            <div className="pt-4">
              <div className="hud-label mb-3">// SUGGESTED QUERIES</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="font-mono text-xs px-3 py-2 text-neon-orange/80 hover:text-white transition-all"
                    style={{
                      border: "1px solid rgba(255,85,0,0.35)",
                      background: "rgba(255,85,0,0.06)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#FF5500"; (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.15)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,85,0,0.35)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.06)"; }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="relative z-10 px-4 py-4"
        style={{ background: "rgba(0,0,0,0.95)", borderTop: "1px solid rgba(255,85,0,0.25)" }}>
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your training, longest ride, pace targets..."
              rows={1}
              id="coach-input"
              className="w-full bg-transparent font-mono text-sm text-white placeholder-white/30 resize-none outline-none py-3 px-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,85,0,0.3)",
                maxHeight: "120px",
                transition: "border-color 0.2s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#FF5500"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,85,0,0.3)"; }}
            />
          </div>
          <button
            id="coach-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="font-bebas text-lg px-6 py-3 text-black tracking-widest flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: "#FF5500", boxShadow: loading ? "none" : "0 0 20px rgba(255,85,0,0.4)" }}
          >
            SEND ⚡
          </button>
        </div>
        <p className="text-center font-mono text-[10px] text-white/25 mt-2 uppercase tracking-widest">
          Enter to send · Shift+Enter for new line · Saved automatically
        </p>
      </div>
    </div>
  );
}
