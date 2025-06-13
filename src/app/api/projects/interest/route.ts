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

      // Check if user already expressed interest
      const existingInterest = await prisma.projectInterest.findUnique({
         where: {
         projectId_userId: {
            projectId,
            userId: user.id
         }
         }
      });

      if (existingInterest) {
         return NextResponse.json({ error: "You have already expressed interest in this project" }, { status: 400 });
      }

      // Create project interest
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

      // Get project interests
      const interests = await prisma.projectInterest.findMany({
         where: { projectId },
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