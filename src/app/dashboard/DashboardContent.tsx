// src/app/dashboard/DashboardContent.tsx
"use client";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

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

// Add Project interface to match your Prisma schema
interface Project {
   id: string;
   title: string;
   description: string;
   techStack: string[];
   tags: string[];
   githubUrl: string | null;
   estimatedTeamSize: number | null;
   createdBy: string;
   createdAt: Date;
   updatedAt: Date;
   status: string; // Now required since we added it to Prisma schema
}

interface DashboardContentProps {
   user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
   const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'teammates'>('overview');
   // Properly type the projects state
   const [projects, setProjects] = useState<Project[]>([]);
   const [projectsLoading, setProjectsLoading] = useState(true);
   const [projectsError, setProjectsError] = useState<string | null>(null);
   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

   useEffect(() => {
      const fetchProjects = async () => {
         try {
            setProjectsLoading(true);
            setProjectsError(null);
            
            const response = await fetch('/api/projects/my-projects');
            
            if (!response.ok) {
            throw new Error('Failed to fetch projects');
            }
            
            const data = await response.json();
            
            if (data.success) {
            setProjects(data.projects);
            } else {
            throw new Error(data.error || 'Failed to fetch projects');
            }
         } catch (err) {
            if(err instanceof Error)
               setProjectsError(err.message);
            console.error('Error fetching projects:', err);
         } finally {
            setProjectsLoading(false);
         }
      };

      fetchProjects();
   }, []);

   //Helper function to format date
   const formatProjectDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', { 
         month: 'short', 
         day: 'numeric',
         year: 'numeric' 
      }).format(new Date(date));
   };

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', { 
         month: 'long', 
         year: 'numeric' 
      }).format(new Date(date));
   };

   // Helper function to get status color
   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case 'active':
            return 'bg-green-100 text-green-800';
         case 'completed':
            return 'bg-blue-100 text-blue-800';
         case 'paused':
            return 'bg-yellow-100 text-yellow-800';
         case 'cancelled':
            return 'bg-red-100 text-red-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   // Helper function to get status display name
   const getStatusDisplayName = (status: string) => {
      switch (status.toLowerCase()) {
         case 'active':
            return 'Active';
         case 'completed':
            return 'Completed';
         case 'paused':
            return 'Paused';
         case 'cancelled':
            return 'Cancelled';
         default:
            return status;
      }
   };

   // Function to update project status
   const updateProjectStatus = async (projectId: string, newStatus: string) => {
      try {
         setUpdatingStatus(projectId);
         
         const response = await fetch('/api/projects/update-status', {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               projectId,
               status: newStatus
            })
         });

         if (!response.ok) {
            throw new Error('Failed to update project status');
         }

         const data = await response.json();
         
         if (data.success) {
            // Update the local projects state
            setProjects(prevProjects => 
               prevProjects.map(project => 
                  project.id === projectId 
                     ? { ...project, status: newStatus, updatedAt: new Date() }
                     : project
               )
            );
         } else {
            throw new Error(data.error || 'Failed to update project status');
         }
      } catch (error) {
         console.error('Error updating project status:', error);
         // You might want to show a toast notification here
         alert('Failed to update project status. Please try again.');
      } finally {
         setUpdatingStatus(null);
      }
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
                        <p className="text-2xl font-bold text-gray-900">
                           {projects.filter(p => p.status === 'active').length}
                        </p>
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
                           <a 
                           href="/create-project"
                           className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                           >
                           <span className="text-2xl">➕</span>
                           <span className="font-medium text-gray-700 group-hover:text-blue-600">Create Project</span>
                           </a>
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
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
                        <a 
                        href="/create-project"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                        + New Project
                        </a>
                     </div>

                     {projectsLoading ? (
                        <div className="space-y-4">
                           {[1, 2, 3].map((i) => (
                              <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                                 <div className="flex justify-between items-start mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                 </div>
                                 <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                 <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                                 <div className="h-3 bg-gray-200 rounded w-24"></div>
                              </div>
                           ))}
                        </div>
                     ) : projectsError ? (
                        <div className="text-center py-8">
                           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">⚠️</span>
                           </div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Projects</h3>
                           <p className="text-gray-500 mb-4">{projectsError}</p>
                           <button
                              onClick={() => window.location.reload()}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                           >
                              Try Again
                           </button>
                        </div>
                     ) : projects.length === 0 ? (
                        <div className="text-center py-12">
                           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-3xl">🚀</span>
                           </div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                           <p className="text-gray-500 mb-6">Start your first project and invite others to collaborate!</p>
                           <a 
                              href="/create-project"
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                           >
                              Create Your First Project
                           </a>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                           <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                              <div className="flex justify-between items-start mb-3">
                                 <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1 mr-3">
                                    {project.title}
                                 </h4>
                                 
                                 {/* Status Dropdown */}
                                 <div className="relative">
                                    <select
                                       value={project.status}
                                       onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                                       disabled={updatingStatus === project.id}
                                       className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-all duration-200 ${getStatusColor(project.status)} ${
                                          updatingStatus === project.id 
                                             ? 'opacity-50 cursor-not-allowed' 
                                             : 'hover:shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                                       }`}
                                    >
                                       <option value="active">Active</option>
                                       <option value="paused">Paused</option>
                                       <option value="completed">Completed</option>
                                       <option value="cancelled">Cancelled</option>
                                    </select>
                                    {updatingStatus === project.id && (
                                       <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {project.description}
                              </p>
                              
                              {/* Tech Stack Tags */}
                              {project.techStack.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mb-3">
                                    {project.techStack.slice(0, 3).map((tech) => (
                                       <span key={tech} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                                          {tech}
                                       </span>
                                    ))}
                                    {project.techStack.length > 3 && (
                                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                          +{project.techStack.length - 3} more
                                       </span>
                                    )}
                                 </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                 <span className="flex items-center">
                                    <span className="mr-1">📅</span>
                                    {formatProjectDate(project.createdAt)}
                                 </span>
                                 <span className="text-blue-600 group-hover:text-blue-700 font-medium cursor-pointer">
                                    View Details →
                                 </span>
                              </div>
                           </div>
                        ))}
                        </div>
                     )}
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