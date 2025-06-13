// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
   params: {
      id: string;
   };
}

// Get single project
export async function GET(req: Request, { params }: RouteParams) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const project = await prisma.project.findUnique({
         where: { id: params.id },
         include: {
         creator: {
            select: {
               id: true,
               name: true,
               email: true,
               image: true,
               username: true,
               bio: true,
               skills: true,
               githubUrl: true,
               linkedinUrl: true,
            }
         },
         teamMembers: {
            include: {
               user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  username: true,
                  skills: true,
               }
               }
            }
         },
         interests: {
            include: {
               user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  username: true,
                  skills: true,
               }
               }
            },
            orderBy: { createdAt: "desc" }
         },
         _count: {
            select: {
               teamMembers: true,
               interests: true,
               discussions: true
            }
         }
         }
      });

      if (!project) {
         return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ project });

   } catch (error) {
      console.error("Error fetching project:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}

// Update project
export async function PUT(req: Request, { params }: RouteParams) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const data = await req.json();
      const { title, description, techStack, tags, githubUrl, estimatedTeamSize, status, goals, requirements } = data;

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if project exists and user owns it
      const existingProject = await prisma.project.findUnique({
         where: { id: params.id },
         select: { createdBy: true }
      });

      if (!existingProject) {
         return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      if (existingProject.createdBy !== user.id) {
         return NextResponse.json({ error: "Not authorized to update this project" }, { status: 403 });
      }

      // Update project
      const updatedProject = await prisma.project.update({
         where: { id: params.id },
         data: {
         title: title?.trim(),
         description: description?.trim(),
         techStack: techStack || [],
         tags: tags || [],
         githubUrl: githubUrl?.trim() || null,
         estimatedTeamSize: estimatedTeamSize || null,
         status: status || "active",
         goals: goals?.trim() || null,
         requirements: requirements?.trim() || null,
         updatedAt: new Date()
         },
         include: {
         creator: {
            select: {
               id: true,
               name: true,
               email: true,
               image: true,
               username: true,
            }
         }
         }
      });

      return NextResponse.json({ 
         success: true,
         project: updatedProject
      });

   } catch (error) {
      console.error("Error updating project:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}

// Delete project
export async function DELETE(req: Request, { params }: RouteParams) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if project exists and user owns it
      const project = await prisma.project.findUnique({
         where: { id: params.id },
         select: { createdBy: true }
      });

      if (!project) {
         return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      if (project.createdBy !== user.id) {
         return NextResponse.json({ error: "Not authorized to delete this project" }, { status: 403 });
      }

      // Delete project (cascade will handle related records)
      await prisma.project.delete({
         where: { id: params.id }
      });

      return NextResponse.json({ success: true });

   } catch (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}