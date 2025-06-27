// src/app/api/users/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserProfileData } from "@/types/user-profile";

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ username: string }> }
) {
   try {
      const { username } = await params;
      
      // Get current user ID from query parameter
      const { searchParams } = new URL(request.url);
      const currentUserId = searchParams.get('currentUserId');
      
      // Get user with all related data in one query
      const user = await prisma.user.findUnique({
         where: { username },
         include: {
            projects: {
               include: {
                  creator: true,
                  teamMembers: {
                     include: {
                        user: true,
                     },
                  },
                  interests: {
                     include: {
                        user: true,
                     },
                  },
                  _count: {
                     select: {
                        teamMembers: true,
                        interests: true,
                     },
                  },
               },
               orderBy: {
                  createdAt: 'desc'
               }
            },
            teamMembers: {
               include: {
                  project: {
                     include: {
                        creator: true,
                        teamMembers: {
                           include: {
                              user: true,
                           },
                        },
                        interests: {
                           include: {
                              user: true,
                           },
                        },
                        _count: {
                           select: {
                              teamMembers: true,
                              interests: true,
                           },
                        },
                     },
                  },
               },
               orderBy: {
                  joinedAt: 'desc'
               }
            },
            projectInterests: {
               include: {
                  project: {
                     include: {
                        creator: true,
                        teamMembers: {
                           include: {
                              user: true,
                           },
                        },
                        interests: {
                           include: {
                              user: true,
                           },
                        },
                        _count: {
                           select: {
                              teamMembers: true,
                              interests: true,
                           },
                        },
                     },
                  },
               },
               orderBy: {
                  createdAt: 'desc'
               }
            },
         },
      });

      if (!user) {
         return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
         );
      }

      // Check if viewing own profile
      const isOwnProfile = currentUserId === user.id;

      // Filter joined projects to exclude created ones
      const joinedProjects = user.teamMembers
         .filter(tm => tm.project.creator.id !== user.id)
         .map(tm => tm.project);

      // Filter interested projects to exclude created and joined ones
      const interestedProjects = user.projectInterests
         .filter(pi => 
            pi.project.creator.id !== user.id && 
            !user.teamMembers.some(tm => tm.projectId === pi.project.id) &&
            pi.status === "pending"
         )
         .map(pi => pi.project);

      // Calculate stats
      const stats = {
         projectsCreated: user.projects.length,
         projectsJoined: joinedProjects.length,
         projectInterests: interestedProjects.length,
      };

      // Prepare user data (exclude sensitive fields if not own profile)
      const userData = {
         id: user.id,
         name: user.name,
         username: user.username,
         bio: user.bio,
         skills: user.skills,
         interests: user.interests,
         image: user.image,
         githubUrl: user.githubUrl,
         linkedinUrl: user.linkedinUrl,
         portfolioUrl: user.portfolioUrl,
         createdAt: user.createdAt,
         emailVerified: user.emailVerified,
         updatedAt: user.updatedAt,
         // Only include email for own profile, ensuring it's never undefined
         email: isOwnProfile ? (user.email ?? null) : null
      };

      const profileData: UserProfileData = {
         user: userData,
         stats,
         projects: {
            created: user.projects,
            joined: joinedProjects,
            interested: interestedProjects,
         },
         isOwnProfile,
      };

      return NextResponse.json(profileData);
   } catch (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}