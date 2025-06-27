// app/api/projects/[id]/team-members/[memberId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { prisma } from '@/lib/prisma'; // Adjust path as needed

export async function DELETE(
   req: Request,
   { params }: { params: { id: string; memberId: string } }
) {
   try {
      // Get the current user session
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
         return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
         );
      }

      // Await params in Next.js 15
      const { id, memberId } = params;
      
      // Debugging: Log the values to ensure they're not undefined
      console.log('ProjectId:', id, 'MemberId:', memberId);

      // Verify that the current user is the project owner
      const project = await prisma.project.findUnique({
         where: { id: id },
         select: { createdBy: true }
      });

      if (!project) {
         return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
         );
      }

      if (project.createdBy !== session.user.id) {
         return NextResponse.json(
            { error: 'Only the project owner can remove team members' },
            { status: 403 }
         );
      }

      // Check if the team member exists
      const teamMember = await prisma.teamMember.findUnique({
         where: { id: memberId },
         include: { user: true }
      });

      if (!teamMember) {
         return NextResponse.json(
            { error: 'Team member not found' },
            { status: 404 }
         );
      }

      // Prevent removing the project creator
      if (teamMember.userId === project.createdBy) {
         return NextResponse.json(
            { error: 'Cannot remove the project creator' },
            { status: 400 }
         );
      }

      // Use a transaction to ensure both operations succeed or fail together
      await prisma.$transaction(async (prisma) => {
         // Remove the team member
         await prisma.teamMember.delete({
            where: { id: memberId }
         });

         // Update the most recent accepted interest for this user to "removed"
         // This allows them to express interest again in the future
         const lastAcceptedInterest = await prisma.projectInterest.findFirst({
            where: {
               projectId: id,
               userId: teamMember.userId,
               status: 'accepted'
            },
            orderBy: {
               createdAt: 'desc'
            }
         });

         if (lastAcceptedInterest) {
            await prisma.projectInterest.update({
               where: { id: lastAcceptedInterest.id },
               data: { 
                  status: 'removed',
                  updatedAt: new Date()
               }
            });
         }
      });

      return NextResponse.json(
         { 
            message: 'Team member removed successfully',
            removedMember: {
               id: teamMember.id,
               userId: teamMember.userId,
               username: teamMember.user.username
            }
         },
         { status: 200 }
      );

   } catch (error) {
      console.error('Error removing team member:', error);
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      );
   }
}