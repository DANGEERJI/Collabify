import { Dispatch, SetStateAction, useState } from "react";

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

interface StatusBadgeProps {
   project: Project;
   projects: Project[];
   setProjects: Dispatch<SetStateAction<Project[]>>;
}

export const StatusBadge = ({project, projects, setProjects}: StatusBadgeProps) => {
   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

   const updateProjectStatus = async (projectId: string, newStatus: string) => {
      try {
         setUpdatingStatus(projectId);

         const response = await fetch('../../app/api/projects/update-status', {
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
         }
      }
   }

}