// app/users/[username]/contents.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/AppHeader';
import { User } from '@prisma/client';


import { 
   User2, 
   Mail, 
   MapPin, 
   Calendar, 
   Github, 
   Linkedin, 
   ExternalLink,
   Settings,
   Edit3,
   Users,
   FolderOpen,
   Heart,
   Star,
   GitFork
} from 'lucide-react';
import { UserProfileData, ProfileTabData } from '@/types/user-profile';

interface UserProfileContentProps {
   profileData: UserProfileData;
   currentUser: User | null;
}

export function UserProfileContent({ profileData, currentUser }: UserProfileContentProps) {
   const { user, stats, projects, isOwnProfile } = profileData;
   const [activeTab, setActiveTab] = useState('created');

   // Prepare tab data
   const tabs: ProfileTabData[] = [
      {
         id: 'created',
         label: 'Created Projects',
         count: stats.projectsCreated,
         content: projects.created
      },
      {
         id: 'joined',
         label: 'Joined Projects',
         count: stats.projectsJoined,
         content: projects.joined
      },
      {
         id: 'interested',
         label: 'Interested Projects',
         count: stats.projectInterests,
         content: projects.interested
      }
   ];

   const displayName = user.name || user.username || 'Anonymous User';
   const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
   });

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <Header user={currentUser} isDashBoard={false}/>
         <div className="max-w-6xl mx-auto px-4 py-8">
         {/* Profile Header */}
         <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
               {/* Avatar and Basic Info */}
               <div className="flex flex-col items-center md:items-start">
               <div className="relative">
                  {user.image ? (
                     <Image
                     src={user.image}
                     alt={displayName}
                     width={120}
                     height={120}
                     className="rounded-full"
                     />
                  ) : (
                     <div className="w-30 h-30 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                     <User2 className="w-12 h-12 text-white" />
                     </div>
                  )}
                  {isOwnProfile && (
                     <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                     <Edit3 className="w-4 h-4" />
                     </button>
                  )}
               </div>
               
               {/* Action Buttons */}
               <div className="mt-4 flex gap-2">
                  {isOwnProfile ? (
                     <Link
                     href="/profile/edit"
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                     <Settings className="w-4 h-4" />
                     Edit Profile
                     </Link>
                  ) : (
                     <div className="flex gap-2">
                     <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Connect
                     </button>
                     <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Message
                     </button>
                     </div>
                  )}
               </div>
               </div>

               {/* Profile Details */}
               <div className="flex-1">
               <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                     <p className="text-lg text-gray-600">@{user.username}</p>
                  </div>
               </div>

               {/* Bio */}
               {user.bio && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                     {user.bio}
                  </p>
               )}

               {/* Contact Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {isOwnProfile && user.email && (
                     <div className="flex items-center gap-2 text-gray-600">
                     <Mail className="w-4 h-4" />
                     <span>{user.email}</span>
                     </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                     <Calendar className="w-4 h-4" />
                     <span>Joined {joinDate}</span>
                  </div>
               </div>

               {/* Social Links */}
               <div className="flex gap-4 mb-6">
                  {user.githubUrl && (
                     <a
                     href={user.githubUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                     >
                     <Github className="w-5 h-5" />
                     <span>GitHub</span>
                     </a>
                  )}
                  {user.linkedinUrl && (
                     <a
                     href={user.linkedinUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                     >
                     <Linkedin className="w-5 h-5" />
                     <span>LinkedIn</span>
                     </a>
                  )}
                  {user.portfolioUrl && (
                     <a
                     href={user.portfolioUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                     >
                     <ExternalLink className="w-5 h-5" />
                     <span>Portfolio</span>
                     </a>
                  )}
               </div>

               {/* Skills */}
               {user.skills.length > 0 && (
                  <div>
                     <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                     <div className="flex flex-wrap gap-2">
                     {user.skills.map((skill, index) => (
                        <span
                           key={index}
                           className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                           {skill}
                        </span>
                     ))}
                     </div>
                  </div>
               )}

               {/* Interests */}
               {user.interests.length > 0 && (
                  <div className="mt-4">
                     <h3 className="text-sm font-semibold text-gray-900 mb-2">Interests</h3>
                     <div className="flex flex-wrap gap-2">
                     {user.interests.map((interest, index) => (
                        <span
                           key={index}
                           className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                           {interest}
                        </span>
                     ))}
                     </div>
                  </div>
               )}
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
               <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
               </div>
               <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsCreated}</p>
                  <p className="text-gray-600">Projects Created</p>
               </div>
               </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
               <div className="flex items-center gap-3">
               <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
               </div>
               <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsJoined}</p>
                  <p className="text-gray-600">Projects Joined</p>
               </div>
               </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
               <div className="flex items-center gap-3">
               <div className="p-3 bg-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600" />
               </div>
               <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectInterests}</p>
                  <p className="text-gray-600">Interested Projects</p>
               </div>
               </div>
            </div>
         </div>

         {/* Projects Section */}
         <div className="bg-white rounded-lg shadow-sm border">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
               <nav className="flex space-x-8 px-6">
               {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`py-4 px-1 border-b-2 font-medium text-sm ${
                     activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                  >
                     {tab.label} ({tab.count})
                  </button>
               ))}
               </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
               {tabs.find(tab => tab.id === activeTab)?.content.length === 0 ? (
               <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                     No {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} yet
                  </h3>
                  <p className="text-gray-600">
                     {isOwnProfile 
                     ? "Start by creating your first project!" 
                     : `${displayName} hasn't ${activeTab} any projects yet.`
                     }
                  </p>
               </div>
               ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tabs.find(tab => tab.id === activeTab)?.content.map((project) => (
                     <ProjectCard key={project.id} project={project} />
                  ))}
               </div>
               )}
            </div>
         </div>
         </div>
      </div>
   );
   }

   function ProjectCard({ project }: { project: any }) {
   return (
      <Link href={`/project/${project.id}`}>
         <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
         <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
               project.status === 'active' ? 'bg-green-100 text-green-800' :
               project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
               'bg-gray-100 text-gray-800'
            }`}>
               {project.status}
            </span>
         </div>
         
         <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description}
         </p>
         
         {/* Tech Stack */}
         {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
               {project.techStack.slice(0, 3).map((tech: string, index: number) => (
               <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tech}
               </span>
               ))}
               {project.techStack.length > 3 && (
               <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{project.techStack.length - 3}
               </span>
               )}
            </div>
         )}
         
         {/* Project Stats */}
         <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
               <Users className="w-4 h-4" />
               <span>{project._count?.teamMembers+1 || 0}</span>
            </div>
            <div className="flex items-center gap-1">
               <Heart className="w-4 h-4" />
               <span>{project._count?.interests || 0}</span>
            </div>
         </div>
         </div>
      </Link>
   );
}