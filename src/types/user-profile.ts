// types/user-profile.ts
import { User, Project, ProjectInterest, TeamMember } from "@prisma/client";

export interface UserProfileData {
   user: User
   stats: {
      projectsCreated: number;
      projectsJoined: number;
      projectInterests: number;
   };
   projects: {
      created: ProjectWithDetails[];
      joined: ProjectWithDetails[];
      interested: ProjectWithDetails[];
   };
   isOwnProfile: boolean;
}

export type ProjectWithDetails = Project & {
   creator: User;
   teamMembers: (TeamMember & {
      user: User;
   })[];
   interests: (ProjectInterest & {
      user: User;
   })[];
   _count: {
      teamMembers: number;
      interests: number;
   };
};

export interface UserProfileStats {
   projectsCreated: number;
   projectsJoined: number;
   projectInterests: number;
   totalCollaborators: number;
   mostUsedTech: string[];
}

export interface ProfileTabData {
   id: string;
   label: string;
   count: number;
   content: ProjectWithDetails[];
}