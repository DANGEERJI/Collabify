// src/app/api/projects/interest/response/route.ts
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

      const { interestId, action } = await req.json(); // action: 'accept' or 'reject'

      if (!interestId || !action || !['accept', 'reject'].includes(action)) {
         return NextResponse.json({ error: "Interest ID and valid action (accept/reject) are required" }, { status: 400 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get the interest with project info
      const interest = await prisma.projectInterest.findUnique({
         where: { id: interestId },
         include: {
         project: {
            select: { id: true, createdBy: true, title: true }
         },
         user: {
            select: { id: true, name: true, email: true }
         }
         }
      });

      if (!interest) {
         return NextResponse.json({ error: "Interest not found" }, { status: 404 });
      }

      // Check if current user owns the project
      if (interest.project.createdBy !== user.id) {
         return NextResponse.json({ error: "Not authorized to respond to this interest" }, { status: 403 });
      }

      // Check if interest is still pending
      if (interest.status !== 'pending') {
         return NextResponse.json({ error: "Interest has already been responded to" }, { status: 400 });
      }

      // Update interest status
      const updatedInterest = await prisma.projectInterest.update({
         where: { id: interestId },
         data: { 
         status: action === 'accept' ? 'accepted' : 'rejected',
         updatedAt: new Date()
         }
      });

      // If accepted, add user as team member
      if (action === 'accept') {
         await prisma.teamMember.create({
         data: {
            projectId: interest.project.id,
            userId: interest.userId,
            role: 'member'
         }
         });
      }

      return NextResponse.json({ 
         success: true,
         interest: updatedInterest,
         message: `Interest ${action}ed successfully`
      });

   } catch (error) {
      console.error("Error responding to project interest:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}