// app/users/[username]/page.tsx
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { UserProfileContent } from './contents';
import { UserProfileData } from '@/types/user-profile';
import { Session } from 'next-auth';

interface PageProps {
   params: Promise<{
      username: string;
   }>;
}

async function getUserProfile(username: string, session: Session | null): Promise<UserProfileData | null> {
   const currentUserId = session?.user?.id;
   try {
      const url = currentUserId 
         ? `${process.env.NEXTAUTH_URL}/api/users/${username}?currentUserId=${currentUserId}` 
         : `${process.env.NEXTAUTH_URL}/api/users/${username}`;
      
      const response = await fetch(url, {
         cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
         return null;
      }
      
      return await response.json();
   } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
   }
}

export async function generateMetadata({ params }: PageProps) {
   const { username } = await params;
   
   try {
      // Get session for metadata generation
      const session = await getServerSession(authOptions);
      const profileData = await getUserProfile(username, session);
      
      if (!profileData) {
         return {
            title: 'User Not Found',
            description: 'The requested user profile could not be found.'
         };
      }
      
      const { user } = profileData;
      const displayName = user.name || user.username || 'User';
      const bio = user.bio || `${displayName}'s profile on our platform`;
      
      return {
         title: `${displayName} (@${user.username})`,
         description: bio,
         openGraph: {
            title: `${displayName} (@${user.username})`,
            description: bio,
            images: user.image ? [user.image] : [],
         },
         twitter: {
            card: 'summary',
            title: `${displayName} (@${user.username})`,
            description: bio,
            images: user.image ? [user.image] : [],
         }
      };
   } catch (error) {
      return {
         title: 'User Profile',
         description: 'View user profile and projects'
      };
   }
}

export default async function UserProfilePage({ params }: PageProps) {
   const { username } = await params;
   
   // Get current session
   const session = await getServerSession(authOptions);
   
   // Fetch user profile data
   const profileData = await getUserProfile(username, session);
   
   if (!profileData) {
      notFound();
   }
   
   return <UserProfileContent profileData={profileData} session={session} />;
}

// Generate static params for popular users (optional optimization)
export async function generateStaticParams() {
   // You can implement this to pre-generate pages for popular users
   // For now, we'll use dynamic generation
   return [];
}