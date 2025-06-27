// src/app/project/[id]/ProjectDetailContent.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {Header} from "@/components/layout/AppHeader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { User, Project, ProjectInterest, TeamMember } from "@prisma/client";
import { ProjectWithDetails } from "@/types";
import { TeamMemberMenu } from "@/components/ui/TeamMemberMenu";
import { useRouter } from "next/navigation";
import { useHardRefresh } from "@/hooks/useHardRefresh";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { OctagonMinusIcon } from "lucide-react";

interface ProjectDetailContentProps {
  project: ProjectWithDetails;
  currentUser: User | null;
  isOwner: boolean;
}

export default function ProjectDetailContent({ 
  project, 
  currentUser,
  isOwner 
}: ProjectDetailContentProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [projects, setProjects] = useState<Project>(project);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const router = useRouter();
  const {sessionRefresh} = useHardRefresh();

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "on-hold", label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" }
  ];

  // Check if current user has already expressed interest
  const hasExpressedInterest = project.interests?.some(
    interest => interest.userId === currentUser?.id && (interest.status==="pending" || interest.status==="accepted")
  );

  const isUserTeamMember = project.teamMembers.some(members => members.userId === currentUser?.id);

  // Get pending interests for owner
  const pendingInterests = project.interests?.filter(
    interest => interest.status === "pending"
  ) || [];

  // Get accepted team members (excluding creator)
  const acceptedMembers = project.teamMembers?.filter(
    member => member.userId !== project.createdBy
  ) || [];

  const handleExpressInterest = async () => {
    if (!currentUser) return;
    
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
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  // Handle interest actions (accept/reject)
  const handleInterestAction = async (interestId: string, action: "accepted" | "rejected") => {
    if(action==="accepted" && (acceptedMembers.length+1) === project.estimatedTeamSize)
    {
      setErrorMessage("Estimated Team size exceeded cannot accept. Increase the team limit by edit project panel.");
      setShowErrorModal(true);
      return;
    }
    try {
      const response = await fetch(`/api/projects/interest/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          interestId, 
          action: action === "accepted" ? "accept" : "reject" 
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // "Interest accepted/rejected successfully"
        
        // Reload to show updated data (matching your existing pattern)
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Error processing application:", error);
        // Optional: Show user-friendly error message
      }
    } catch (error) {
      console.error("Error handling interest action:", error);
      // Optional: Show user-friendly error message
    }
  };



// Function to handle viewing a user's profile
  const handleViewProfile = (user: any) => {
    const username = user.username || user.id; // Fallback to ID if username is not available
    router.push(`/users/${username}`);
  };

// Function to handle removing a team member
  const handleRemoveMember = async (memberToRemove: any) => {
    setIsRemoving(true);
    const id = project.id;
    try {
      const response = await fetch(`/api/projects/${id}/team-members/${memberToRemove.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }

      // Update the local state to remove the member from the UI
      // You'll need to update your acceptedMembers state
      // setAcceptedMembers(prev => prev.filter(member => member.id !== memberToRemove.id));
      
      // Or if you're using a refresh pattern:
      // router.refresh();
      setShowRemoveModal(false);
      setMemberToRemove(null);
      await sessionRefresh();
    } catch (error) {
      console.error('Error removing team member:', error);
    } finally {
      setIsRemoving(false);
    }
  };

// Remove Member Confirmation Modal Component
  const RemoveMemberModal = () => {
    if (!showRemoveModal || !memberToRemove) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Remove Team Member</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <UserAvatar user={memberToRemove.user} size="sm" />
              <div>
                <p className="font-medium text-gray-900">
                  {memberToRemove.user.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-600">
                  @{memberToRemove.user.username || "user"}
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to remove <strong>{memberToRemove.user.name || "this member"}</strong> from the team? 
            They will lose access to the project and all team discussions.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRemoveModal(false);
                setMemberToRemove(null);
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isRemoving}
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemoveMember(memberToRemove)}
              disabled={isRemoving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRemoving ? 'Removing...' : 'Remove Member'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <Header
        isDashBoard={false}
        user={currentUser}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
                
                {/* Enhanced Status Display */}
                <div className="flex items-center gap-3">
                  {isOwner ? (
                    <div className="relative">
                      <StatusBadge currentUserId="" project={project} onStatusUpdate={(updatedProject) => {
                        setProjects(updatedProject);
                      }}
                      />
                    </div>
                  ) : (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentStatus)} whitespace-nowrap`}>
                      {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
                    </span>
                  )}
                </div>
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
              {!isOwner && currentUser && !hasExpressedInterest && (
                <button
                  onClick={() => setShowInterestModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <span className="mr-2">✨</span>
                  Express Interest
                </button>
              )}

              {/*Check if User has expressed interest but not in the team yet*/}
              {!isOwner && hasExpressedInterest && !isUserTeamMember && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-medium text-sm inline-flex items-center justify-center shadow-md">
                  <span className="mr-1">✅</span>
                  Interest Expressed
                </div>
              )}

              {/*Check if User has expressed interest but is in the team*/}
              {!isOwner && hasExpressedInterest && isUserTeamMember && (
                <div className="align-middle justify-center bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm inline-flex items-center shadow-lg">
                  <span className="mr-1 text-xl">🚀</span>
                  In the Team
                </div>
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
                <>
                  <Link
                    href={`/project/${project.id}/edit`}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-center shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <span className="mr-2">✏️</span>
                    Edit Project
                  </Link>
                  <Link
                    href={`/project/${project.id}/manage`}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium text-center shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <span className="mr-2">⚙️</span>
                    Manage Team
                  </Link>
                  {pendingInterests.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("applicants");

                        setTimeout(() => {
                          const tabElement = document.getElementById("project-tabs");
                          if(tabElement) {
                            tabElement.scrollIntoView({
                              behavior: "smooth",
                              block: "start"
                            });
                          }
                        }, 100);
                      }}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium text-center shadow-sm hover:shadow-md transform hover:scale-105 relative"
                    >
                      <span className="mr-2">📧</span>
                      View Applications
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {pendingInterests.length}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pending Applications Alert for Owner */}
        {isOwner && pendingInterests.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    New Applications Pending Review
                  </h3>
                  <p className="text-amber-700">
                    {pendingInterests.length} {pendingInterests.length === 1 ? 'person has' : 'people have'} expressed interest in joining your project.
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("applicants");

                  setTimeout(() => {
                    const tabElement = document.getElementById("project-tabs");
                    if(tabElement) {
                      tabElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      });
                    }
                  }, 100);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer"
              >
                Review Applications
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: "📋" },
                { id: "team", label: "Team", icon: "👥" },
                { id: "applicants", label: "Applicants", icon: "✋", ownerOnly: true, count: pendingInterests.length },
                { id: "discussions", label: "Discussions", icon: "💬" },
                { id: "resources", label: "Resources", icon: "📚" },
                { id: "activity", label: "Activity", icon: "⚡" },
              ].filter(tab => !tab.ownerOnly || isOwner).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8" id="project-tabs">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Project Goals & Requirements - Enhanced */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">🎯</span>
                    Project Goals & Requirements
                  </h3>
                  
                  {project.goals && (
                    <div className="bg-white rounded-lg p-6 border border-blue-100 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🚀</span>
                        Goals & Vision
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        {project.goals.split('\n').map((paragraph, index) => (
                          paragraph.trim() && (
                            <p key={index} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {project.requirements && (
                    <div className="bg-white rounded-lg p-6 border border-blue-100 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">📋</span>
                        Requirements & Skills Needed
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        {project.requirements.split('\n').map((paragraph, index) => (
                          paragraph.trim() && (
                            <p key={index} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show message if no goals/requirements */}
                  {!project.goals && !project.requirements && (
                    <div className="bg-white rounded-lg p-6 border border-blue-100">
                      <p className="text-gray-600 leading-relaxed text-center">
                        {isOwner 
                          ? "Add your project goals and requirements by editing the project. This will help potential collaborators understand your vision and what skills you're looking for."
                          : "The project creator hasn't added detailed goals and requirements yet. You can still express interest to learn more about the project vision."
                        }
                      </p>
                      {isOwner && (
                        <div className="text-center mt-4">
                          <Link
                            href={`/project/${project.id}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <span className="mr-1">✏️</span>
                            Add Goals & Requirements
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Creator */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">👨‍💻</span>
                    Project Creator
                  </h3>
                  <div className="flex items-start gap-6">
                    <UserAvatar user={project.creator} size="lg" />
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                        {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Team Size</span>
                      <span className="font-medium text-gray-900">
                        {acceptedMembers.length + 1}/{project.estimatedTeamSize || "∞"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Technologies</span>
                      <span className="font-medium text-gray-900">
                        {project.techStack.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Applications</span>
                      <span className="font-medium text-gray-900">
                        {project.interests?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Preview */}
                {(acceptedMembers.length > 0 || isOwner) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                      Team Members
                      <span className="text-sm font-normal text-gray-500">
                        {acceptedMembers.length + 1}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {/* Creator */}
                      <div className="flex items-center gap-3">
                        <UserAvatar user={project.creator} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.creator.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">Creator</p>
                        </div>
                      </div>

                      {/* Team Members */}
                      {acceptedMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <UserAvatar user={member.user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.user.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                          </div>
                        </div>
                      ))}
                      
                      {acceptedMembers.length > 3 && (
                        <div className="text-center">
                          <button
                            onClick={() => setActiveTab("team")}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            +{acceptedMembers.length - 3} more members
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Project created</p>
                        <p className="text-xs text-gray-500">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                    {project.updatedAt > project.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">Project updated</p>
                          <p className="text-xs text-gray-500">{formatDate(project.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                    {acceptedMembers.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900">New team member joined</p>
                          <p className="text-xs text-gray-500">Recent activity</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Team Members</h3>
                <div className="text-sm text-gray-500">
                  {acceptedMembers.length + 1} {acceptedMembers.length === 0 ? 'member' : 'members'}
                </div>
              </div>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Creator */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 relative">
                  {/* Creator doesn't get a menu */}
                  <div className="flex items-center gap-4 mb-4">
                    <UserAvatar user={project.creator} size="lg" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {project.creator.name || "Anonymous"}
                      </h4>
                      <p className="text-sm text-gray-600">@{project.creator.username || "user"}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        👑 Creator
                      </span>
                    </div>
                  </div>
                  
                  {project.creator.bio && (
                    <p className="text-sm text-gray-600 mb-4">{project.creator.bio}</p>
                  )}
                  
                  {project.creator.skills && project.creator.skills.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-1">
                        {project.creator.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-white text-gray-600 px-2 py-1 rounded text-xs border"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.creator.skills.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{project.creator.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                {acceptedMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all relative ${
                      openMenuId === member.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    {/* Blur overlay when menu is open */}
                    {openMenuId === member.id && (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl z-5" />
                    )}
                    
                    {/* 3-dot menu button */}
                    <div className="absolute top-4 right-4 z-10">
                      <TeamMemberMenu
                        setOpenMenuId={setOpenMenuId}
                        member={member}
                        isOwner={isOwner}
                        onViewProfile={handleViewProfile}
                        onRemoveMember={(memberToRemove) => {
                          setMemberToRemove(memberToRemove);
                          setShowRemoveModal(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <UserAvatar user={member.user} size="lg" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {member.user.name || "Anonymous"}
                        </h4>
                        <p className="text-sm text-gray-600">@{member.user.username || "user"}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1 capitalize">
                          {member.role}
                        </span>
                      </div>
                    </div>
                    
                    {member.user.bio && (
                      <p className="text-sm text-gray-600 mb-4">{member.user.bio}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-4">
                      Joined {formatDate(member.joinedAt)}
                    </div>
                    
                    {member.user.skills && member.user.skills.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {member.user.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.user.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{member.user.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty State for Team */}
                {acceptedMembers.length === 0 && (
                  <div className="col-span-full bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-4">👥</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Looking for Team Members</h4>
                    <p className="text-gray-600 mb-4">
                      {isOwner 
                        ? "Review applications and build your dream team!"
                        : "Be the first to join this exciting project!"
                      }
                    </p>
                    {!isOwner && currentUser && !hasExpressedInterest && (
                      <button
                        onClick={() => setShowInterestModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Join the Team
                      </button>
                    )}
                  </div>
                )}
              </div>
              <RemoveMemberModal/>
            </div>
          )}

          {activeTab === "applicants" && isOwner && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Project Applications</h3>
                <div className="text-sm text-gray-500">
                  {pendingInterests.length} pending applications
                </div>
              </div>

              {pendingInterests.length > 0 ? (
                <div className="space-y-4">
                  {pendingInterests.map((interest) => (
                    <div key={interest.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-6">
                        <UserAvatar user={interest.user} size="lg" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {interest?.user?.name || "Anonymous"}
                              </h4>
                              <p className="text-gray-600">@{interest.user.username || "user"}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-500">Applied</span>
                              <p className="text-sm font-medium">{formatDate(interest.createdAt)}</p>
                            </div>
                          </div>
                          
                          {interest.user.bio && (
                            <p className="text-gray-600 mb-4">{interest.user.bio}</p>
                          )}
                          
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Application Message</h5>
                            <p className="text-gray-600 leading-relaxed">{interest.message}</p>
                          </div>
                          
                          {interest.user.skills && interest.user.skills.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Skills & Expertise</h5>
                              <div className="flex flex-wrap gap-2">
                                {interest.user.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleInterestAction(interest.id, "accepted")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                            >
                              <span>✅</span>
                              Accept
                            </button>
                            <button
                              onClick={() => handleInterestAction(interest.id, "rejected")}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                            >
                              <span>❌</span>
                              Reject
                            </button>
                            <div className="flex gap-2 ml-auto">
                              {interest.user.githubUrl && (
                                <a
                                  href={interest.user.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600 transition-colors p-2"
                                  title="GitHub Profile"
                                >
                                  🔗
                                </a>
                              )}
                              {interest.user.linkedinUrl && (
                                <a
                                  href={interest.user.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600 transition-colors p-2"
                                  title="LinkedIn Profile"
                                >
                                  💼
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-4xl mb-4">📭</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h4>
                  <p className="text-gray-600">
                    Applications will appear here when people express interest in your project.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "discussions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Project Discussions</h3>
                {(isOwner || acceptedMembers.some(m => m.userId === currentUser?.id)) && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Start Discussion
                  </button>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Discussions Yet</h4>
                <p className="text-gray-600 mb-4">
                  Start the conversation! Discussions help team members collaborate and share ideas.
                </p>
                {(isOwner || acceptedMembers.some(m => m.userId === currentUser?.id)) && (
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Start First Discussion
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Project Resources</h3>
                {(isOwner || acceptedMembers.some(m => m.userId === currentUser?.id)) && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add Resource
                  </button>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">📚</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Resources Yet</h4>
                <p className="text-gray-600 mb-4">
                  Share documents, links, and files to help your team collaborate effectively.
                </p>
                {(isOwner || acceptedMembers.some(m => m.userId === currentUser?.id)) && (
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add First Resource
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Project Activity</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🚀</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Project Created</p>
                    <p className="text-sm text-gray-600">
                      {project.creator.name} created this project
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(project.createdAt)}</p>
                  </div>
                </div>

                {project.updatedAt > project.createdAt && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Project Updated</p>
                      <p className="text-sm text-gray-600">Project details were modified</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(project.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {acceptedMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">👥</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">New Team Member</p>
                      <p className="text-sm text-gray-600">
                        {member.user.name} joined the team
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(member.joinedAt)}</p>
                    </div>
                  </div>
                ))}

                {project.interests && project.interests.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600">✋</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Interest Expressed</p>
                      <p className="text-sm text-gray-600">
                        {project.interests.length} {project.interests.length === 1 ? 'person has' : 'people have'} shown interest
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Recent activity</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/*Error Modal*/}
        {showErrorModal && (
          <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} showModal={showErrorModal} setShowModal={setShowErrorModal}/> 
        )}
        {/* Interest Modal */}
        {showInterestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Express Interest</h3>
              <p className="text-gray-600 mb-4">
                Tell the project creator why you'd like to join their team:
              </p>
              <textarea
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                placeholder="I'm interested in this project because..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleExpressInterest}
                  disabled={isSubmittingInterest || !interestMessage.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmittingInterest ? "Submitting..." : "Send Application"}
                </button>
                <button
                  onClick={() => {
                    setShowInterestModal(false);
                    setInterestMessage("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}