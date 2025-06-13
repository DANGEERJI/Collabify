// src/app/project/[id]/ProjectDetailContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

interface User {
   id: string;
   name: string | null;
   email: string | null;
   image: string | null;
   username: string | null;
   bio?: string | null;
   skills?: string[];
   githubUrl?: string | null;
   linkedinUrl?: string | null;
}

interface Project {
   id: string;
   title: string;
   description: string;
   techStack: string[];
   tags: string[];
   githubUrl: string | null;
   estimatedTeamSize: number | null;
   status: string;
   createdAt: Date;
   updatedAt: Date;
   creator: User;
}

interface ProjectDetailContentProps {
   project: Project;
   currentUser: User;
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
         // You might want to refresh the page or update the UI
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

   return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
         {/* Header */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-4">
               <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
               <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
               </span>
               </div>
               
               <p className="text-gray-600 text-lg mb-6 leading-relaxed">
               {project.description}
               </p>

               {/* Tech Stack */}
               <div className="mb-6">
               <h3 className="text-sm font-semibold text-gray-900 mb-3">Tech Stack</h3>
               <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                     <span 
                     key={index}
                     className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                     >
                     {tech}
                     </span>
                  ))}
               </div>
               </div>

               {/* Tags */}
               <div className="mb-6">
               <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
               <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                     <span 
                     key={index}
                     className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                     >
                     {tag}
                     </span>
                  ))}
               </div>
               </div>

               {/* Project Info */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
               <div>
                  <span className="text-gray-500">Team Size:</span>
                  <span className="ml-2 font-medium">
                     {project.estimatedTeamSize ? `${project.estimatedTeamSize} members` : "Flexible"}
                  </span>
               </div>
               <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium">
                     {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </span>
               </div>
               <div>
                  <span className="text-gray-500">Updated:</span>
                  <span className="ml-2 font-medium">
                     {format(new Date(project.updatedAt), "MMM d, yyyy")}
                  </span>
               </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 lg:ml-6">
               {!isOwner && (
               <button
                  onClick={() => setShowInterestModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                  Express Interest
               </button>
               )}
               
               {project.githubUrl && (
               <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
               >
                  View on GitHub
               </a>
               )}

               {isOwner && (
               <Link
                  href={`/project/${project.id}/edit`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
               >
                  Edit Project
               </Link>
               )}
            </div>
         </div>
         </div>

         {/* Navigation Tabs */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
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
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
         <div className="p-6">
            {activeTab === "overview" && (
               <div className="space-y-6">
               {/* Project Creator */}
               <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Creator</h3>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                     {project.creator.image ? (
                        <Image
                           src={project.creator.image}
                           alt={project.creator.name || "User"}
                           width={48}
                           height={48}
                           className="rounded-full"
                        />
                     ) : (
                        <span className="text-blue-600 font-semibold text-lg">
                           {project.creator.name?.charAt(0) || "U"}
                        </span>
                     )}
                     </div>
                     <div>
                     <h4 className="font-semibold text-gray-900">
                        {project.creator.name || "Anonymous"}
                     </h4>
                     <p className="text-gray-600 text-sm">
                        @{project.creator.username || "user"}
                     </p>
                     {project.creator.bio && (
                        <p className="text-gray-600 text-sm mt-1">{project.creator.bio}</p>
                     )}
                     </div>
                     <div className="ml-auto flex gap-2">
                     {project.creator.githubUrl && (
                        <a
                           href={project.creator.githubUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-gray-600 hover:text-gray-900"
                        >
                           GitHub
                        </a>
                     )}
                     {project.creator.linkedinUrl && (
                        <a
                           href={project.creator.linkedinUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-gray-600 hover:text-gray-900"
                        >
                           LinkedIn
                        </a>
                     )}
                     </div>
                  </div>
                  
                  {project.creator.skills && project.creator.skills.length > 0 && (
                     <div className="mt-4">
                     <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
                     <div className="flex flex-wrap gap-2">
                        {project.creator.skills.map((skill, index) => (
                           <span
                           key={index}
                           className="bg-white text-gray-700 px-2 py-1 rounded text-xs border"
                           >
                           {skill}
                           </span>
                        ))}
                     </div>
                     </div>
                  )}
               </div>

               {/* Project Goals */}
               <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Goals</h3>
                  <p className="text-gray-600">
                     This section would contain detailed project goals, milestones, and objectives.
                     The creator can add this information when editing the project.
                  </p>
               </div>
               </div>
            )}

            {activeTab === "team" && (
               <div className="text-center py-12">
               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
               <p className="text-gray-600 mb-6">
                  Team collaboration features will be implemented here.
               </p>
               </div>
            )}

            {activeTab === "discussions" && (
               <div className="text-center py-12">
               <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Discussions</h3>
               <p className="text-gray-600 mb-6">
                  Discussion threads and comments will be available here.
               </p>
               </div>
            )}

            {activeTab === "resources" && (
               <div className="text-center py-12">
               <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Resources</h3>
               <p className="text-gray-600 mb-6">
                  Shared files, links, and resources will be organized here.
               </p>
               </div>
            )}

            {activeTab === "activity" && (
               <div className="text-center py-12">
               <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
               <p className="text-gray-600 mb-6">
                  Project timeline and activity feed will be shown here.
               </p>
               </div>
            )}
         </div>
         </div>

         {/* Interest Modal */}
         {showInterestModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
               <h3 className="text-xl font-semibold text-gray-900 mb-4">
               Express Interest in "{project.title}"
               </h3>
               <p className="text-gray-600 mb-4">
               Send a message to the project creator explaining why you'd like to join this project.
               </p>
               <textarea
               value={interestMessage}
               onChange={(e) => setInterestMessage(e.target.value)}
               placeholder="Hi! I'm interested in joining your project because..."
               className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4"
               />
               <div className="flex gap-3">
               <button
                  onClick={() => setShowInterestModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={handleExpressInterest}
                  disabled={!interestMessage.trim() || isSubmittingInterest}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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