// src/app/api/projects/interest/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { projectId, message } = await req.json();

      if (!projectId || !message) {
         return NextResponse.json({ error: "Project ID and message are required" }, { status: 400 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if project exists
      const project = await prisma.project.findUnique({
         where: { id: projectId },
         select: { id: true, createdBy: true, title: true }
      });

      if (!project) {
         return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Prevent user from expressing interest in their own project
      if (project.createdBy === user.id) {
         return NextResponse.json({ error: "Cannot express interest in your own project" }, { status: 400 });
      }

      // Check if user is currently a team member
      const currentTeamMember = await prisma.teamMember.findUnique({
         where: {
            projectId_userId: {
               projectId,
               userId: user.id
            }
         }
      });

      if (currentTeamMember) {
         return NextResponse.json({ error: "You are already a member of this project" }, { status: 400 });
      }

      // Check for existing interests from this user for this project
      const existingInterests = await prisma.projectInterest.findMany({
         where: {
            projectId,
            userId: user.id
         },
         orderBy: { createdAt: "desc" }
      });

      // Check if there's a pending interest
      const pendingInterest = existingInterests.find(interest => interest.status === "pending");
      
      if (pendingInterest) {
         return NextResponse.json({ 
            error: "You already have a pending interest request for this project. Please wait for the project owner to respond." 
         }, { status: 400 });
      }

      // If user has previous interests but none are pending, they can create a new one
      // This allows users to re-apply after being rejected or removed

      // Create new project interest
      const projectInterest = await prisma.projectInterest.create({
         data: {
            projectId,
            userId: user.id,
            message: message.trim(),
            status: "pending"
         },
         include: {
            user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  username: true,
                  skills: true
               }
            }
         }
      });

      return NextResponse.json({ 
         success: true,
         interest: projectInterest
      });

   } catch (error) {
      console.error("Error creating project interest:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}

// Get project interests (for project owners)
export async function GET(req: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const url = new URL(req.url);
      const projectId = url.searchParams.get("projectId");
      const status = url.searchParams.get("status"); // Optional filter by status

      if (!projectId) {
         return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user owns the project
      const project = await prisma.project.findUnique({
         where: { id: projectId },
         select: { createdBy: true }
      });

      if (!project) {
         return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      if (project.createdBy !== user.id) {
         return NextResponse.json({ error: "Not authorized to view interests for this project" }, { status: 403 });
      }

      // Build where clause
      const whereClause: any = { projectId };
      if (status && ["pending", "accepted", "rejected", "removed"].includes(status)) {
         whereClause.status = status;
      }

      // Get project interests
      const interests = await prisma.projectInterest.findMany({
         where: whereClause,
         include: {
            user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  username: true,
                  bio: true,
                  skills: true,
                  githubUrl: true,
                  linkedinUrl: true
               }
            }
         },
         orderBy: { createdAt: "desc" }
      });

      return NextResponse.json({ interests });

   } catch (error) {
      console.error("Error fetching project interests:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}

// Update interest status (accept/reject/remove)
export async function PATCH(req: Request) {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user || !session.user.email) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { interestId, status } = await req.json();

      if (!interestId || !status) {
         return NextResponse.json({ error: "Interest ID and status are required" }, { status: 400 });
      }

      if (!["accepted", "rejected", "removed"].includes(status)) {
         return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get the interest and verify ownership
      const interest = await prisma.projectInterest.findUnique({
         where: { id: interestId },
         include: {
            project: {
               select: { createdBy: true, id: true }
            },
            user: {
               select: { id: true }
            }
         }
      });

      if (!interest) {
         return NextResponse.json({ error: "Interest not found" }, { status: 404 });
      }

      if (interest.project.createdBy !== user.id) {
         return NextResponse.json({ error: "Not authorized to update this interest" }, { status: 403 });
      }

      // Update the interest status
      const updatedInterest = await prisma.projectInterest.update({
         where: { id: interestId },
         data: { 
            status,
            updatedAt: new Date()
         },
         include: {
            user: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  username: true,
                  skills: true
               }
            }
         }
      });

      // If accepting the interest, add user to team
      if (status === "accepted") {
         await prisma.teamMember.create({
            data: {
               projectId: interest.project.id,
               userId: interest.user.id,
               role: "member"
            }
         });
      }

      // If removing from team, also remove from team members
      if (status === "removed") {
         await prisma.teamMember.deleteMany({
            where: {
               projectId: interest.project.id,
               userId: interest.user.id
            }
         });
      }

      return NextResponse.json({ 
         success: true,
         interest: updatedInterest
      });

   } catch (error) {
      console.error("Error updating project interest:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}