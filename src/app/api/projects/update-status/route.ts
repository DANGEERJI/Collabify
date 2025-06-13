// src/app/api/projects/update-status/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   try {
      const { projectId, status } = await req.json();

      // Validate input
      if (!projectId || !status) {
         return NextResponse.json(
            { error: "Project ID and status are required" }, 
            { status: 400 }
         );
      }

      // Validate status values
      const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
      if (!validStatuses.includes(status.toLowerCase())) {
         return NextResponse.json(
            { error: "Invalid status. Must be one of: active, completed, paused, cancelled" }, 
            { status: 400 }
         );
      }

      // Check if project exists and belongs to the user
      const existingProject = await prisma.project.findFirst({
         where: {
            id: projectId,
            createdBy: session.user.id
         }
      });

      if (!existingProject) {
         return NextResponse.json(
            { error: "Project not found or you don't have permission to update it" }, 
            { status: 404 }
         );
      }

      // Update the project status
      const updatedProject = await prisma.project.update({
         where: {
            id: projectId
         },
         data: {
            status: status.toLowerCase(),
            updatedAt: new Date()
         }
      });

      return NextResponse.json({
         success: true,
         project: updatedProject,
         message: "Project status updated successfully"
      });

   } catch (error) {
      console.error("Error updating project status:", error);
      return NextResponse.json(
         { error: "Failed to update project status" }, 
         { status: 500 }
      );
   }
}