//src/app/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Prevent running on server
    
    const checkUserStatus = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          const userData = await response.json();
          
          if (response.ok && userData.username) {
            router.push("/dashboard");
          } else if (response.ok && !userData.username) {
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // Only redirect to onboarding if we're sure there's no username
          router.push("/onboarding");
        }
      }
      setIsChecking(false);
    };

    if (status !== "loading") {
      checkUserStatus();
    }
  }, [session, status, router, isClient]);

  // Show loading only during initial load or when checking authenticated user
  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl text-white font-bold">C</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-2 w-24 bg-gray-100 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting only when authenticated and checking
  if (status === "authenticated" && isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-2xl text-white font-bold">C</span>
          </div>
          <p className="text-lg text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Collabify</h1>
            </div>
            
            <button
              onClick={() => signIn('google')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          {/* Logo with modern styling */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl transform hover:scale-105 transition-all duration-300">
              <span className="text-4xl text-white font-bold">C</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-gray-900">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Collabify
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Connect with brilliant minds across universities. 
            <br className="hidden sm:block" />
            <span className="text-blue-600">Find teammates</span>, 
            <span className="text-purple-600"> showcase skills</span>, 
            <span className="text-green-600"> build the future</span>.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { 
              icon: "🤝", 
              title: "Find Teammates", 
              desc: "Connect with students who complement your skills and share your passion for innovation.",
              color: "from-blue-600 to-blue-700",
              bgColor: "bg-blue-50",
              borderColor: "border-blue-200"
            },
            { 
              icon: "🚀", 
              title: "Build Projects", 
              desc: "Turn your ideas into reality with collaborative power and shared expertise.",
              color: "from-purple-600 to-purple-700",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200"
            },
            { 
              icon: "🏆", 
              title: "Showcase Work", 
              desc: "Build your portfolio, gain recognition, and open doors to new opportunities.",
              color: "from-green-600 to-green-700",
              bgColor: "bg-green-50",
              borderColor: "border-green-200"
            }
          ].map((feature, i) => (
            <div key={i} className={`bg-white rounded-xl shadow-sm border ${feature.borderColor} p-8 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-4 text-xl">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Projects Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Universities</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pb-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">Ready to start collaborating?</h2>
            <p className="text-xl mb-8 text-blue-100">Join thousands of students building the future together.</p>
            
            <button
              onClick={() => signIn('google')}
              className="bg-white text-gray-900 font-bold px-12 py-4 rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg flex items-center justify-center mx-auto space-x-3 min-w-[280px]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Free Forever</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center space-x-4 text-gray-500">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-sm">© 2024 Collabify. Built for students, by students.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}