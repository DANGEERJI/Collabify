import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   try {
      const data = await req.json();
      const { 
         title, 
         description, 
         techStack, 
         tags, 
         githubUrl, 
         estimatedTeamSize 
      } = data;

      // Validation
      if (!title || title.trim().length < 3) {
         return NextResponse.json(
         { error: "Title must be at least 3 characters long" }, 
         { status: 400 }
         );
      }

      if (!description || description.trim().length < 10) {
         return NextResponse.json(
         { error: "Description must be at least 10 characters long" }, 
         { status: 400 }
         );
      }

      // Validate GitHub URL if provided
      if (githubUrl && githubUrl.trim()) {
         const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
         if (!githubUrlPattern.test(githubUrl.trim())) {
         return NextResponse.json(
            { error: "Please provide a valid GitHub repository URL" }, 
            { status: 400 }
         );
         }
      }

      // Validate team size if provided
      if (estimatedTeamSize && (estimatedTeamSize < 1 || estimatedTeamSize > 20)) {
         return NextResponse.json(
         { error: "Team size must be between 1 and 20 members" }, 
         { status: 400 }
         );
      }

      // Create project
      const project = await prisma.project.create({
         data: {
         title: title.trim(),
         description: description.trim(),
         techStack: Array.isArray(techStack) ? techStack : [],
         tags: Array.isArray(tags) ? tags : [],
         githubUrl: githubUrl?.trim() || null,
         estimatedTeamSize: estimatedTeamSize || null,
         createdBy: session.user.id,
         },
         include: {
         creator: {
            select: {
               id: true,
               name: true,
               username: true,
            }
         }
         }
      });

      return NextResponse.json({ 
         success: true, 
         project 
      });

   } catch (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
         { error: "Failed to create project. Please try again." }, 
         { status: 500 }
      );
   }
}

export async function GET(req: Request) {
   const session = await getServerSession(authOptions);
   
   if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   try {
      const projects = await prisma.project.findMany({
         include: {
         creator: {
            select: {
               id: true,
               name: true,
               username: true,
            }
         }
         },
         orderBy: {
         createdAt: 'desc'
         }
      });

      return NextResponse.json({ projects });

   } catch (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
         { error: "Failed to fetch projects" }, 
         { status: 500 }
      );
   }
}