import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { StravaConnect } from "@/components/dashboard/StravaConnect";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { ParticleCanvas } from "@/components/dashboard/ParticleCanvas";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let user;
  let dbError = false;

  try {
    await connectDB();
    user = await User.findOne({ email: session.user?.email });
  } catch (error) {
    console.error("Database connection error:", error);
    dbError = true;
  }

  if (!user && !dbError) {
    redirect("/login");
  }

  // Database error state — cyberpunk style
  if (dbError || !user) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleCanvas />
        <div className="relative z-10 max-w-lg w-full border border-red-alert/60 bg-cyber-card p-8"
          style={{ boxShadow: "0 0 40px rgba(255,23,68,0.3)" }}>
          <div className="text-center">
            <div className="text-6xl mb-4 font-bebas text-red-alert"
              style={{ textShadow: "0 0 20px rgba(255,23,68,0.8)" }}>
              ERROR_DB
            </div>
            <div className="hud-label mb-6 text-red-alert">// DATABASE CONNECTION FAULT</div>
            <p className="text-white/60 mb-6 font-mono text-sm">
              Unable to connect to MongoDB. System is running but database is offline.
            </p>
            <div className="border border-neon-orange/30 bg-black/40 p-4 mb-6 text-left text-sm font-mono">
              <div className="text-neon-orange mb-2">[ FIX SEQUENCE ]</div>
              <div className="text-white/60 space-y-1">
                <div>1. MongoDB Atlas → Network Access → whitelist IP</div>
                <div>2. Local: start mongod → update .env.local</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <a href="/dashboard" className="btn-brutal px-6 py-3 text-sm">
                RETRY
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black relative">
      <ParticleCanvas />

      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neon-orange/20"
        style={{ borderLeft: "4px solid #FF5500" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Athlytic Logo" className="h-8 object-contain" />
            </div>

            {/* Right side — buttons + avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* COACH + ROAST — collapse text on very small screens */}
              <div className="flex items-center gap-2">
                <a
                  href="/chat"
                  id="nav-coach-btn"
                  className="btn-brutal px-3 sm:px-5 py-2 text-xs rounded-none flex items-center gap-1.5"
                >
                  <span>🤖</span>
                  <span className="hidden xs:inline sm:inline">COACH</span>
                </a>
                <a
                  href="/roast"
                  id="nav-roast-btn"
                  className="btn-brutal px-3 sm:px-5 py-2 text-xs rounded-none flex items-center gap-1.5"
                  style={{ borderColor: "#E91E8C" }}
                >
                  <span>🔥</span>
                  <span className="hidden xs:inline sm:inline">ROAST</span>
                </a>
              </div>

              {/* Avatar — hide name on small screens */}
              <div className="hidden sm:flex items-center gap-2 border border-neon-orange/30 px-3 py-1.5 bg-black/60">
                <div
                  className="w-7 h-7 flex items-center justify-center bg-neon-orange text-black font-bebas text-sm"
                >
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="font-mono text-xs text-white/70 hidden md:block">
                  {user.name || user.email}
                </span>
              </div>

              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user.stravaConnected ? (
          <div className="animate-slide-up">
            <StravaConnect />
          </div>
        ) : (
          <div className="animate-fade-in">
            <ActivityList userId={user._id.toString()} />
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 mt-16 py-6 border-t border-neon-orange/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-mono text-xs text-white/30 tracking-widest uppercase">
            ⚡ ATHLYTIC // BUILT FOR ELITE ATHLETES // {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
