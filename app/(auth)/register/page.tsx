import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-600 mb-8">Sign up to get started</p>

          <OAuthButtons />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

