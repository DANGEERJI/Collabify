// src/app/api/user/profile/edit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
   name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
   bio: z.string().max(500, 'Bio too long').optional(),
   skills: z.array(z.string()).max(20, 'Too many skills'),
   interests: z.array(z.string()).max(20, 'Too many interests'),
   githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
   linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
   portfolioUrl: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
});

export async function PUT(request: NextRequest) {
   try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const validatedData = updateProfileSchema.parse(body);

      // Convert empty strings to null for URL fields
      const updateData = {
         ...validatedData,
         githubUrl: validatedData.githubUrl || null,
         linkedinUrl: validatedData.linkedinUrl || null,
         portfolioUrl: validatedData.portfolioUrl || null,
         bio: validatedData.bio || null,
      };

      const updatedUser = await prisma.user.update({
         where: { id: session.user.id },
         data: updateData,
      });

      return NextResponse.json({
         message: 'Profile updated successfully',
         user: updatedUser,
      });

   } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof z.ZodError) {
         return NextResponse.json({
         error: 'Validation failed',
         details: error.errors,
         }, { status: 400 });
      }

      return NextResponse.json({
         error: 'Failed to update profile',
      }, { status: 500 });
   }
}