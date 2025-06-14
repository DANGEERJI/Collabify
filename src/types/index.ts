// src/types/index.ts

// Database User type (matches Prisma schema)
export interface User {
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

// Project type (matches database structure)
export interface Project {
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

// Helper function to convert SessionUser to User
export function sessionUserToUser(sessionUser: SessionUser): User {
   return {
      id: sessionUser.id,
      name: sessionUser.name ?? null,
      email: sessionUser.email ?? null,
      image: sessionUser.image ?? null,
      username: sessionUser.username ?? null,
      bio: sessionUser.bio ?? null,
      skills: sessionUser.skills ?? [],
      githubUrl: sessionUser.githubUrl ?? null,
      linkedinUrl: sessionUser.linkedinUrl ?? null,
   };
}