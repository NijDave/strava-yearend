"use client";

import { useState } from "react";
import Link from "next/link";

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-bold text-orange-400">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-zinc-800 text-orange-300 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-700">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

function FormatRoast({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    elements.push(<ul key={key} className="space-y-4 my-6">{listItems}</ul>);
    listItems = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushList(`fl${i}`);
      elements.push(<h3 key={i} className="text-2xl md:text-3xl font-black uppercase tracking-tighter mt-10 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 leading-none">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("## ")) {
      flushList(`fl${i}`);
      elements.push(<h2 key={i} className="text-3xl md:text-4xl font-black uppercase tracking-tighter mt-12 mb-6 text-white border-b-2 border-orange-600/30 pb-2 inline-block leading-none">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      listItems.push(
        <li key={i} className="flex gap-4 items-start group">
          <span className="text-orange-500 mt-1 transition-transform group-hover:scale-125 duration-300">⚡</span>
          <span className="text-lg md:text-xl text-zinc-300 leading-relaxed font-medium">{formatInline(trimmed.slice(2))}</span>
        </li>
      );
    } else if (trimmed === "") {
      flushList(`fl${i}`);
      elements.push(<div key={i} className="h-4" />);
    } else {
      flushList(`fl${i}`);
      elements.push(<p key={i} className="text-lg md:text-xl leading-relaxed text-zinc-300 font-medium mb-4">{formatInline(trimmed)}</p>);
    }
  });
  flushList("final");
  return <div className="space-y-2">{elements}</div>;
}

export default function RoastPage() {
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateRoast = async () => {
    setLoading(true);
    setError(null);
    setRoast(null);
    try {
      const res = await fetch("/api/ai/roast");
      const data = await res.json();
      if (data.roast) {
        setRoast(data.roast);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Something went wrong with the roast engine.");
      }
    } catch (err) {
      setError("Failed to connect to the roaster. You got lucky today.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        {/* Extra "embers" background effect */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #f97316 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <header className="flex justify-between items-center mb-16">
          <Link href="/dashboard" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all flex items-center gap-3 group">
            <span className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center transition-all group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-black">
              <span className="transition-transform group-hover:-translate-x-0.5 text-xs">←</span>
            </span>
             Dashboard
          </Link>
          <div className="text-3xl font-black italic tracking-tighter hover:scale-105 transition-transform cursor-default">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">STRVA</span>
            <span className="ml-1 text-white">ROAST</span>
          </div>
        </header>

        <main className="text-center space-y-12">
          {!roast && !loading && (
            <div className="space-y-10 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-5xl xs:text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-4">
                THINK <br/>
                YOU'RE AN <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_0_30px_rgba(249,115,22,0.2)]">ATHLETE?</span>
              </h1>
              <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-tight px-4">
                Our AI has deep-scanned your data. Your PRs aren't the only things that are <span className="text-white font-bold italic underline decoration-orange-500">mediocre</span>.
              </p>
              <div className="pt-6">
                <button
                  onClick={initiateRoast}
                  className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] border-4 border-transparent hover:border-black"
                >
                  <span className="relative z-10 flex items-center gap-3 text-sm">
                    DESTROY MY EGO <span className="animate-bounce">🔥</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-12 py-32">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-orange-500 border-r-red-500 border-b-purple-600 border-l-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">🔥</div>
              </div>
              <div className="space-y-4">
                <p className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  Calculating your mediocrity...
                </p>
                <p className="text-gray-500 font-medium">Reading between the lines of your "recovery" runs.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/10 border border-red-500/30 p-10 rounded-3xl space-y-6 max-w-xl mx-auto shadow-2xl backdrop-blur-xl">
              <div className="text-5xl">🤡</div>
              <h2 className="text-2xl font-bold text-red-500">ROAST FAILED</h2>
              <p className="text-gray-400 font-medium">{error}</p>
              <button
                onClick={initiateRoast}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all font-bold uppercase tracking-wider text-sm"
              >
                Try to get roasted again
              </button>
            </div>
          )}

          {roast && (
            <div className="space-y-10 py-6 text-left max-w-3xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-800"></div>
                <div className="px-5 py-1.5 bg-red-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">
                  The Destruction
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-800"></div>
              </div>
              
              <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 md:p-14 rounded-[2rem] backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
                {/* Visual accents */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-orange-600/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <FormatRoast text={roast} />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
                <button
                  onClick={initiateRoast}
                  className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-all font-bold uppercase tracking-widest text-xs"
                >
                  RE-IGNITE THE FLAME
                </button>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white text-black rounded-full hover:bg-gray-200 transition-all font-bold uppercase tracking-widest text-xs text-center"
                >
                  RETREAT TO DASHBOARD
                </Link>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-32 pb-12 text-center text-gray-600 text-xs font-medium tracking-widest uppercase opacity-50">
          <p>© {new Date().getFullYear()} ATHLYTIC · EMBRACE THE BURN</p>
        </footer>
      </div>
    </div>
  );
}
