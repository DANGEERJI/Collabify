// src/types/index.ts
import { User, Project, ProjectInterest, TeamMember } from "@prisma/client";

// Session User type (matches NextAuth session structure)
export interface SessionUser {
   id: string;
   name?: string | null | undefined;
   email?: string | null | undefined;
   image?: string | null | undefined;
   username?: string | null | undefined;
   bio?: string | null;
   skills?: string[];
   githubUrl?: string | null;
   linkedinUrl?: string | null;
}

// Helper function to convert SessionUser to User
export function sessionUserToUser(sessionUser: SessionUser): User {
   return {
      id: sessionUser.id,
      name: sessionUser.name ?? null,
      email: sessionUser.email ?? null,
      emailVerified: null,        // ✅ Add this
      image: sessionUser.image ?? null,
      username: sessionUser.username ?? null,
      bio: sessionUser.bio ?? null,
      skills: sessionUser.skills ?? [],
      interests: [],              // ✅ Add this
      githubUrl: sessionUser.githubUrl ?? null,
      linkedinUrl: sessionUser.linkedinUrl ?? null,
      portfolioUrl: null,         // ✅ Add this
      createdAt: new Date(),      // ✅ Add this
      updatedAt: new Date(),      // ✅ Add this
   };
}

export type ProjectWithDetails = Project & {
   creator: User;
   interests: (ProjectInterest & {
      user: User;
   })[];
   teamMembers: (TeamMember & {
      user: User;
   })[];
};