// src/app/profile/edit/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditProfileForm from './EditProfileForm';

export default async function EditProfilePage() {
   const session = await getServerSession(authOptions);

   if (!session?.user?.id) {
      redirect('/api/auth/signin');
   }

   // Fetch current user data
   const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
         id: true,
         name: true,
         email: true,
         emailVerified: true,
         username: true,
         bio: true,
         skills: true,
         interests: true,
         githubUrl: true,
         linkedinUrl: true,
         portfolioUrl: true,
         image: true,
         createdAt: true,
         updatedAt: true,
      },
   });

   if (!user) {
      redirect('/onboarding');
   }

   return (
      <EditProfileForm user={user}/>
   );
}