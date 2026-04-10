import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black px-4 py-12 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 hex-pattern opacity-40" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-2 flex justify-center">
            <img src="/logo.png" alt="Athlytic Logo" className="h-16 object-contain" />
          </div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
            // ELITE ATHLETE ANALYTICS
          </div>
        </div>

        <div className="bg-cyber-card border border-neon-orange/30 p-8"
          style={{ boxShadow: "0 0 40px rgba(255,85,0,0.08)" }}>
          {/* Corner accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neon-orange/60" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neon-orange/60" />

          <div className="hud-label mb-1 text-neon-orange/60">// IDENTITY VERIFICATION</div>
          <h1 className="font-bebas text-3xl text-white mb-6 tracking-wider">SIGN IN TO YOUR ACCOUNT</h1>

          <OAuthButtons />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neon-orange/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-cyber-card font-mono text-xs text-white/40 uppercase tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}

