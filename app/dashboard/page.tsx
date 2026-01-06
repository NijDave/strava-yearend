import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { StravaConnect } from "@/components/dashboard/StravaConnect";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const user = await User.findOne({ email: session.user?.email });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏃</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Strava Year-End
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user.stravaConnected ? (
          <div className="animate-fade-in">
            <StravaConnect />
          </div>
        ) : (
          <div className="animate-slide-up">
            <ActivityList userId={user._id.toString()} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>Made with ❤️ for athletes everywhere</p>
        </div>
      </footer>
    </div>
  );
}
