// src/hooks/useHardRefresh.ts
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const useHardRefresh = () => {
   const router = useRouter();
   const { update } = useSession();

   // Method 1: Simple hard refresh
   const hardRefresh = (redirectTo?: string) => {
      if (redirectTo) {
         window.location.href = redirectTo;
      } else {
         window.location.reload();
      }
   };

   // Method 2: Session + cache refresh
   const sessionRefresh = async (redirectTo?: string) => {
      try {
         // Update session
         await fetch('/api/auth/session?update');
         
         // Clear Next.js router cache
         router.refresh();
         
         // Clear all cached data
         if ('caches' in window) {
         const cacheNames = await caches.keys();
         await Promise.all(cacheNames.map(name => caches.delete(name)));
         }
         
         // Redirect or stay on current page
         if (redirectTo) {
         setTimeout(() => {
            router.push(redirectTo);
         }, 100);
         }
      } catch (error) {
         console.error('Session refresh failed:', error);
         // Fallback to hard refresh
         hardRefresh(redirectTo);
      }
   };

   // Method 3: Ultimate refresh (nuclear option)
   const ultimateRefresh = async (redirectTo?: string) => {
      try {
         // Update NextAuth session
         await update();
         
         // Update session via API
         await fetch('/api/auth/session?update');
         
         // Clear all caches
         if ('caches' in window) {
         const cacheNames = await caches.keys();
         await Promise.all(cacheNames.map(name => caches.delete(name)));
         }
         
         // Clear router cache
         router.refresh();
         
         // Force complete refresh
         setTimeout(() => {
         if (redirectTo) {
            window.location.href = redirectTo;
         } else {
            window.location.reload();
         }
         }, 200);
         
      } catch (error) {
         console.error('Ultimate refresh failed:', error);
         hardRefresh(redirectTo);
      }
   };

   return {
      hardRefresh,
      sessionRefresh,
      ultimateRefresh,
   };
};