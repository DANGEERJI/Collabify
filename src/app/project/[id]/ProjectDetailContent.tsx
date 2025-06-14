// src/app/project/[id]/ProjectDetailContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { type User, type Project } from "@/types";

interface ProjectDetailContentProps {
   project: Project;
   currentUser: User | null;
   isOwner: boolean;
}

export default function ProjectDetailContent({ 
   project, 
   currentUser, 
   isOwner 
}: ProjectDetailContentProps) {
   const [activeTab, setActiveTab] = useState("overview");
   const [showInterestModal, setShowInterestModal] = useState(false);
   const [interestMessage, setInterestMessage] = useState("");
   const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
   const [imageError, setImageError] = useState(false);

   const handleExpressInterest = async () => {
      setIsSubmittingInterest(true);
      try {
         const response = await fetch(`/api/projects/interest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               projectId: project.id,
               message: interestMessage
            })
         });

         if (response.ok) {
            setShowInterestModal(false);
            setInterestMessage("");
            window.location.reload();
         }
      } catch (error) {
         console.error("Error expressing interest:", error);
      } finally {
         setIsSubmittingInterest(false);
      }
   };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case "active": return "bg-green-100 text-green-800";
         case "completed": return "bg-blue-100 text-blue-800";
         case "on-hold": return "bg-yellow-100 text-yellow-800";
         case "cancelled": return "bg-red-100 text-red-800";
         default: return "bg-gray-100 text-gray-800";
      }
   };

   const formatDate = (date: Date) => {
      return format(new Date(date), "MMM d, yyyy");
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         {/* Header */}
         <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-4">
                     <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Collabify</h1>
                     </Link>
                     <span className="text-gray-300">|</span>
                     <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Dashboard
                     </Link>
                  </div>
                  
                  {currentUser && (
                     <div className="flex items-center space-x-4">
                        <div className="text-right">
                           <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                           <p className="text-xs text-gray-500">@{currentUser.username || "user"}</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </header>

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Project Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
               <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="flex-1">
                     <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status)} whitespace-nowrap`}>
                           {project.status}
                        </span>
                     </div>
                     
                     <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        {project.description}
                     </p>

                     {/* Tech Stack */}
                     <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                           <span className="mr-2">⚡</span>
                           Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {project.techStack.map((tech, index) => (
                              <span 
                                 key={index}
                                 className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                              >
                                 {tech}
                              </span>
                           ))}
                        </div>
                     </div>

                     {/* Categories */}
                     <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                           <span className="mr-2">🏷️</span>
                           Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {project.tags.map((tag, index) => (
                              <span 
                                 key={index}
                                 className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                              >
                                 {tag}
                              </span>
                           ))}
                        </div>
                     </div>

                     {/* Project Info Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">👥</span>
                              <span className="text-sm font-medium text-gray-600">Team Size</span>
                           </div>
                           <span className="text-lg font-semibold text-gray-900">
                              {project.estimatedTeamSize ? `${project.estimatedTeamSize} members` : "Flexible"}
                           </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">📅</span>
                              <span className="text-sm font-medium text-gray-600">Created</span>
                           </div>
                           <span className="text-lg font-semibold text-gray-900">
                              {formatDate(project.createdAt)}
                           </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">🔄</span>
                              <span className="text-sm font-medium text-gray-600">Updated</span>
                           </div>
                           <span className="text-lg font-semibold text-gray-900">
                              {formatDate(project.updatedAt)}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                     {!isOwner && (
                        <button
                           onClick={() => setShowInterestModal(true)}
                           className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                           <span className="mr-2">✨</span>
                           Express Interest
                        </button>
                     )}
                     
                     {project.githubUrl && (
                        <a
                           href={project.githubUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium text-center shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                           <span className="mr-2">🔗</span>
                           View on GitHub
                        </a>
                     )}

                     {isOwner && (
                        <Link
                           href={`/project/${project.id}/edit`}
                           className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-center shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                           <span className="mr-2">✏️</span>
                           Edit Project
                        </Link>
                     )}
                  </div>
               </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
               <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                     {[
                        { id: "overview", label: "Overview", icon: "📋" },
                        { id: "team", label: "Team", icon: "👥" },
                        { id: "discussions", label: "Discussions", icon: "💬" },
                        { id: "resources", label: "Resources", icon: "📚" },
                        { id: "activity", label: "Activity", icon: "⚡" },
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                              activeTab === tab.id
                                 ? "border-blue-500 text-blue-600"
                                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                           }`}
                        >
                           <span className="mr-2">{tab.icon}</span>
                           {tab.label}
                        </button>
                     ))}
                  </nav>
               </div>

               {/* Tab Content */}
               <div className="p-8">
                  {activeTab === "overview" && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                           {/* Project Creator */}
                           <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                 <span className="mr-2">👨‍💻</span>
                                 Project Creator
                              </h3>
                              <div className="flex items-start gap-6">
                                 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                                    {project.creator.image && !imageError ? (
                                       <Image
                                          src={project.creator.image}
                                          alt={project.creator.name || "User"}
                                          width={64}
                                          height={64}
                                          className="rounded-full object-cover"
                                          onError={() => setImageError(true)}
                                       />
                                    ) : (
                                       <span className="text-white font-semibold text-xl">
                                          {project.creator.name?.charAt(0) || "U"}
                                       </span>
                                    )}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                       {project.creator.name || "Anonymous"}
                                    </h4>
                                    <p className="text-gray-600 mb-3">
                                       @{project.creator.username || "user"}
                                    </p>
                                    {project.creator.bio && (
                                       <p className="text-gray-600 mb-4 leading-relaxed">{project.creator.bio}</p>
                                    )}
                                    
                                    <div className="flex gap-4">
                                       {project.creator.githubUrl && (
                                          <a
                                             href={project.creator.githubUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                                          >
                                             <span>🔗</span>
                                             <span>GitHub</span>
                                          </a>
                                       )}
                                       {project.creator.linkedinUrl && (
                                          <a
                                             href={project.creator.linkedinUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                                          >
                                             <span>💼</span>
                                             <span>LinkedIn</span>
                                          </a>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              
                              {project.creator.skills && project.creator.skills.length > 0 && (
                                 <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3">Skills & Expertise</h5>
                                    <div className="flex flex-wrap gap-2">
                                       {project.creator.skills.map((skill, index) => (
                                          <span
                                             key={index}
                                             className="bg-white text-gray-700 px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                          >
                                             {skill}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>

                           {/* Project Goals */}
                           <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                 <span className="mr-2">🎯</span>
                                 Project Goals & Vision
                              </h3>
                              <div className="bg-white rounded-lg p-6 border border-blue-100">
                                 <p className="text-gray-600 leading-relaxed">
                                    This section would contain detailed project goals, milestones, and objectives.
                                    The creator can add this information when editing the project to help potential 
                                    collaborators understand the project's vision and what they hope to achieve.
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                           {/* Quick Stats */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                       {project.status}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Team Size</span>
                                    <span className="font-medium text-gray-900">
                                       {project.estimatedTeamSize || "Flexible"}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Technologies</span>
                                    <span className="font-medium text-gray-900">
                                       {project.techStack.length}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Interest CTA */}
                           {!isOwner && (
                              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Interested in Joining?</h3>
                                 <p className="text-gray-600 text-sm mb-4">
                                    Express your interest and let the creator know why you'd be a great addition to the team!
                                 </p>
                                 <button
                                    onClick={() => setShowInterestModal(true)}
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
                                 >
                                    Get Started
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Other tabs with modern empty states */}
                  {activeTab === "team" && (
                     <div className="text-center py-16">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="text-3xl">👥</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Team Management</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                           Team collaboration features will be implemented here. Manage team members, roles, and permissions.
                        </p>
                        <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                           Coming Soon
                        </div>
                     </div>
                  )}

                  {activeTab === "discussions" && (
                     <div className="text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="text-3xl">💬</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Project Discussions</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                           Discussion threads, comments, and real-time chat will be available here for team collaboration.
                        </p>
                        <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                           Coming Soon
                        </div>
                     </div>
                  )}

                  {activeTab === "resources" && (
                     <div className="text-center py-16">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="text-3xl">📚</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Project Resources</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                           Shared files, documentation, links, and other resources will be organized and accessible here.
                        </p>
                        <div className="inline-flex items-center px-6 py-3 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                           Coming Soon
                        </div>
                     </div>
                  )}

                  {activeTab === "activity" && (
                     <div className="text-center py-16">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="text-3xl">⚡</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Recent Activity</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                           Project timeline, activity feed, and progress updates will be displayed here.
                        </p>
                        <div className="inline-flex items-center px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                           Coming Soon
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </main>

         {/* Interest Modal */}
         {showInterestModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
               <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
                  <div className="text-center mb-6">
                     <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">✨</span>
                     </div>
                     <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        Express Interest
                     </h3>
                     <p className="text-gray-600">
                        Tell {project.creator.name} why you'd like to join "{project.title}"
                     </p>
                  </div>
                  
                  <textarea
                     value={interestMessage}
                     onChange={(e) => setInterestMessage(e.target.value)}
                     placeholder="Hi! I'm interested in joining your project because..."
                     className="w-full p-4 border border-gray-300 rounded-xl resize-none h-32 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  
                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowInterestModal(false)}
                        className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleExpressInterest}
                        disabled={!interestMessage.trim() || isSubmittingInterest}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                     >
                        {isSubmittingInterest ? "Sending..." : "Send Interest"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}