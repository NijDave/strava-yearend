"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-blue-50 text-blue-700 px-1 rounded text-xs">{part.slice(1, -1)}</code>;
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
    if (listType === "ul") elements.push(<ul key={key} className="ml-4 space-y-1 my-2">{listItems}</ul>);
    else elements.push(<ol key={key} className="ml-4 space-y-1 my-2 list-decimal">{listItems}</ol>);
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      flushList(`fl${i}`);
      elements.push(<h3 key={i} className="text-sm font-bold mt-3 mb-1 text-gray-800">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushList(`fl${i}`);
      elements.push(<h2 key={i} className="text-base font-bold mt-3 mb-1 text-gray-800">{line.slice(3)}</h2>);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      if (listType !== "ul") { flushList(`fl${i}`); listType = "ul"; }
      listItems.push(<li key={i} className="text-sm leading-relaxed list-disc ml-4">{formatInline(line.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      if (listType !== "ol") { flushList(`fl${i}`); listType = "ol"; }
      listItems.push(<li key={i} className="text-sm leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ""))}</li>);
    } else if (line.trim() === "") {
      flushList(`fl${i}`);
      elements.push(<div key={i} className="h-1" />);
    } else {
      flushList(`fl${i}`);
      elements.push(<p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>);
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
        setMessages([{ role: "assistant", content: "Hey! I'm your **Athlytic AI Coach** 💪\n\nI have access to your complete Strava history. Ask me anything:\n* Training plans & improvements\n* Your best runs, rides & stats\n* Year-by-year comparisons\n* General sports & fitness questions" }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "Hey! I'm your Athlytic AI Coach 💪 Ask me anything about your training!" }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI. Make sure Ollama is running!" }]);
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

  return (
    <div className="flex flex-col h-screen" style={{ background: "linear-gradient(135deg, #eff6ff, #f5f3ff, #fdf2f8)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/30 backdrop-blur-lg sticky top-0 z-10" style={{ background: "rgba(255,255,255,0.8)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-xl" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
          🤖
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">Athlytic AI Coach</h1>
          <p className="text-xs text-gray-500">Powered by Gemma3 · Your personal coach</p>
        </div>
        <div className="ml-auto">
          <a href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg text-white shadow transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            ← Dashboard
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-md" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white" }}>
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user" ? "text-white rounded-br-none" : "text-gray-800 rounded-bl-none"}`}
                  style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" }
                    : { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)" }}
                >
                  {msg.role === "assistant"
                    ? <FormatMessage text={msg.content} />
                    : <p className="text-sm">{msg.content}</p>}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-md bg-gray-200 text-gray-600">
                    👤
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-md" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white" }}>🤖</div>
              <div className="rounded-2xl rounded-bl-none px-4 py-3 shadow-sm" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.1)" }}>
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#2563eb", animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#7c3aed", animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#2563eb", animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="px-4 py-4 border-t border-white/30 backdrop-blur-lg" style={{ background: "rgba(255,255,255,0.8)" }}>
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your training, longest ride, training plans..."
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none text-gray-800 placeholder-gray-400 shadow-sm"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(99,102,241,0.25)", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="text-white rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40 shadow-lg hover:opacity-90 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter to send · Shift+Enter for new line · Conversation saved automatically
        </p>
      </div>
    </div>
  );
}
