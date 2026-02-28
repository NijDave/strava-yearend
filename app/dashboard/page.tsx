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

  // If database is not available, show error message
  if (dbError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Database Connection Error</h1>
            <p className="text-gray-600 mb-6">
              Unable to connect to MongoDB. Your application is running, but the database is not accessible.
            </p>

            <div className="bg-white/50 rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-gray-800 mb-3">To fix this issue:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  <strong>MongoDB Atlas:</strong> Whitelist your IP address in{" "}
                  <a
                    href="https://cloud.mongodb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    MongoDB Atlas
                  </a>
                  {" "}→ Network Access
                </li>
                <li>
                  <strong>Local MongoDB:</strong> Start MongoDB locally and update{" "}
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm">.env.local</code>
                </li>
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <a
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-block"
              >
                Retry Connection
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Athlytic
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
