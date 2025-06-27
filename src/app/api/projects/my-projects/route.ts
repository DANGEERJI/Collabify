//src/app/api/projects/my-projects/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
   const session = await getServerSession(authOptions);
   if(!session?.user || !session.user.email) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
   }
   
   try {
      // Fetch projects created by the user
      const createdProjects = await prisma.project.findMany({
         where: {
            createdBy: session.user.id
         },
         include: {
            creator: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
               }
            },
            teamMembers: {
               include: {
                  user: {
                     select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                     }
                  }
               }
            },
            _count: {
               select: {
                  teamMembers: true,
                  discussions: true
               }
            }
         },
         orderBy: {
            createdAt: 'desc'
         }
      });

      // Fetch projects where user is a team member
      const memberProjects = await prisma.project.findMany({
         where: {
            teamMembers: {
               some: {
                  userId: session.user.id
               }
            },
            // Exclude projects where user is the creator (to avoid duplicates)
            NOT: {
               createdBy: session.user.id
            }
         },
         include: {
            creator: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
               }
            },
            teamMembers: {
               include: {
                  user: {
                     select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                     }
                  }
               }
            },
            _count: {
               select: {
                  teamMembers: true,
                  discussions: true
               }
            }
         },
         orderBy: {
            createdAt: 'desc'
         }
      });

      // Combine both arrays
      const allProjects = [...createdProjects, ...memberProjects];

      // Sort combined array by createdAt descending
      allProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
         success: true, 
         projects: allProjects,
         count: allProjects.length,
         breakdown: {
            created: createdProjects.length,
            member: memberProjects.length
         }
      });
   } catch (error) {
      console.error("Error fetching projects: ", error);
      return NextResponse.json(
         {error: "Failed to fetch projects"}, 
         {status: 500}
      );
   }
}