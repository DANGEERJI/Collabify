//src/app/page.tsx

'use client';

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          // Fetch fresh user data from the database
          const response = await fetch('/api/user/profile');
          const userData = await response.json();
          
          if (response.ok && userData.username) {
            // User has completed onboarding
            router.push("/dashboard");
          } else if (response.ok && !userData.username) {
            // User hasn't completed onboarding
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // Fallback to session data
          if (!session?.user?.username) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        }
      }
      setIsChecking(false);
    };

    if (status !== "loading") {
      checkUserStatus();
    }
  }, [session, status, router]);

  if (status === "loading" || (status === "authenticated" && isChecking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl text-white font-bold">C</span>
          </div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // While redirecting to onboarding or dashboard, show loading
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">C</span>
          </div>
          <p className="text-lg text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-3xl text-white font-bold">C</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Collabify
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with talented students across universities. 
            Find teammates, showcase your skills, and build amazing projects together.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Find Teammates</h3>
              <p className="text-gray-600">Discover students with complementary skills for your projects</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Build Projects</h3>
              <p className="text-gray-600">Collaborate on exciting projects and learn together</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Showcase Skills</h3>
              <p className="text-gray-600">Build your portfolio and get recognized by peers</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="space-y-4">
            <button
              onClick={() => signIn('google')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Get Started with Google
            </button>
            
            <p className="text-sm text-gray-500">
              Free for all students • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}