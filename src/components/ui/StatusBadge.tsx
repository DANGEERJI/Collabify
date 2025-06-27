import { useState } from "react";
import { Project } from "@prisma/client";

interface StatusBadgeProps {
   project: Project;
   currentUserId: string; // Add current user ID to determine ownership
   onStatusUpdate: (updatedProject: Project) => void;
}

export const StatusBadge = ({ project, currentUserId, onStatusUpdate }: StatusBadgeProps) => {
   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
   
   // Check if current user is the project owner
   const isOwner = project.createdBy === currentUserId;
   
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
            // Create updated project and pass it to the callback
            const updatedProject = {
               ...project,
               status: newStatus,
               updatedAt: new Date()
            };
            onStatusUpdate(updatedProject);
         } else {
            throw new Error(data.error || 'Failed to update project status');
         }
      } catch (err) {
         console.error('Error updating project status: ', err);
         alert('Failed to update project status, Please try again.');
      } finally {
         setUpdatingStatus(null);
      }
   };

   // If user is not the owner, show read-only status badge
   if (!isOwner) {
      return (
         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
         </span>
      );
   }

   // If user is the owner, show editable dropdown
   return (
      <div className="relative">
         <select
            value={project.status}
            onChange={(e) => {
               e.stopPropagation();
               updateProjectStatus(project.id, e.target.value);
            }}
            disabled={updatingStatus === project.id}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-all duration-200 ${getStatusColor(project.status)} ${
               updatingStatus === project.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
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
   );
};