// src/app/dashboard/DashboardContent.tsx
"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface User {
   id: string;
   username: string | null;
   name: string | null;
   bio: string | null;
   skills: string[];
   interests: string[];
   createdAt: Date;
   githubUrl: string | null;
   linkedinUrl: string | null;
   portfolioUrl: string | null;
}

interface DashboardContentProps {
   user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
   const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'teammates'>('overview');

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', { 
         month: 'long', 
         year: 'numeric' 
      }).format(new Date(date));
   };

   // Handle sign out with proper redirect
   const handleSignOut = () => {
      signOut({ 
         callbackUrl: '/', // Explicitly redirect to homepage
         redirect: true 
      });
   };

   // Handle potential null values safely
   const displayName = user.name?.split(' ')[0] || 'there';
   const displayUsername = user.username || 'unknown';

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         {/* Header */}
         <header className="bg-white shadow-sm border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
               </div>
               <h1 className="text-2xl font-bold text-gray-900">Collabify</h1>
               </div>
               
               <div className="flex items-center space-x-4">
               <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">@{displayUsername}</p>
               </div>
               <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
               >
                  Sign Out
               </button>
               </div>
            </div>
         </div>
         </header>

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Welcome Section */}
         <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
               Welcome back, {displayName}! 👋
            </h2>
            <p className="text-gray-600">
               Ready to collaborate and build something amazing today?
            </p>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center">
               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
               </div>
               <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
               </div>
               </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center">
               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
               </div>
               <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
               </div>
               </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <div className="flex items-center">
               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
               </div>
               <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skills</p>
                  <p className="text-2xl font-bold text-gray-900">{user.skills.length}</p>
               </div>
               </div>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="mb-6">
            <nav className="flex space-x-8 border-b border-gray-200">
               {[
               { id: 'overview', name: 'Overview', icon: '📊' },
               { id: 'projects', name: 'Projects', icon: '🚀' },
               { id: 'teammates', name: 'Find Teammates', icon: '🔍' }
               ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                     activeTab === tab.id
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
               >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
               </button>
               ))}
            </nav>
         </div>

         {/* Tab Content */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
               {activeTab === 'overview' && (
               <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                        <span className="text-2xl">➕</span>
                        <span className="font-medium text-gray-700 group-hover:text-blue-600">Create Project</span>
                     </button>
                     <button className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group">
                        <span className="text-2xl">🔍</span>
                        <span className="font-medium text-gray-700 group-hover:text-green-600">Find Teammates</span>
                     </button>
                     </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                     <div className="space-y-4">
                     <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                           <span className="text-sm">🎉</span>
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-900">Welcome to Collabify!</p>
                           <p className="text-xs text-gray-500">Joined {formatDate(user.createdAt)}</p>
                        </div>
                     </div>
                     <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">No recent activity yet. Start by creating a project or finding teammates!</p>
                     </div>
                     </div>
                  </div>
               </div>
               )}

               {activeTab === 'projects' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center py-12">
                     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-3xl">🚀</span>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                     <p className="text-gray-500 mb-6">Start your first project and invite others to collaborate!</p>
                     <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                     Create Your First Project
                     </button>
                  </div>
               </div>
               )}

               {activeTab === 'teammates' && (
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center py-12">
                     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <span className="text-3xl">👥</span>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Your Perfect Teammates</h3>
                     <p className="text-gray-500 mb-6">Discover talented students with complementary skills!</p>
                     <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                     Start Searching
                     </button>
                  </div>
               </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Profile Card */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
               <div className="space-y-4">
                  <div>
                     <p className="text-sm font-medium text-gray-600">Bio</p>
                     <p className="text-sm text-gray-900 mt-1">
                     {user.bio || "Add a bio to tell others about yourself!"}
                     </p>
                  </div>
                  
                  {user.skills.length > 0 && (
                     <div>
                     <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                     <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 6).map((skill) => (
                           <span key={skill} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                           {skill}
                           </span>
                        ))}
                        {user.skills.length > 6 && (
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                           +{user.skills.length - 6} more
                           </span>
                        )}
                     </div>
                     </div>
                  )}

                  {/* Links */}
                  {(user.githubUrl || user.linkedinUrl || user.portfolioUrl) && (
                     <div>
                     <p className="text-sm font-medium text-gray-600 mb-2">Links</p>
                     <div className="space-y-2">
                        {user.githubUrl && (
                           <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" 
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                           <span>🔗</span>
                           <span>GitHub</span>
                           </a>
                        )}
                        {user.linkedinUrl && (
                           <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                           <span>💼</span>
                           <span>LinkedIn</span>
                           </a>
                        )}
                        {user.portfolioUrl && (
                           <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
                           <span>🌐</span>
                           <span>Portfolio</span>
                           </a>
                        )}
                     </div>
                     </div>
                  )}

                  <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                     Edit Profile
                  </button>
               </div>
               </div>

               {/* Tips Card */}
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Getting Started</h3>
               <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                     <span className="text-green-500 mt-0.5">✓</span>
                     <span className="text-gray-700">Complete your profile</span>
                  </div>
                  <div className="flex items-start space-x-2">
                     <span className="text-gray-400 mt-0.5">○</span>
                     <span className="text-gray-600">Create your first project</span>
                  </div>
                  <div className="flex items-start space-x-2">
                     <span className="text-gray-400 mt-0.5">○</span>
                     <span className="text-gray-600">Find and connect with teammates</span>
                  </div>
                  <div className="flex items-start space-x-2">
                     <span className="text-gray-400 mt-0.5">○</span>
                     <span className="text-gray-600">Join other interesting projects</span>
                  </div>
               </div>
               </div>
            </div>
         </div>
         </main>
      </div>
   );
}