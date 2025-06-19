// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
   const session = await getServerSession(authOptions);
   
   if (!session?.user) {
      redirect("/auth/signin");
   }

   const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { 
         id: true,
         username: true, 
         name: true,
         email: true,
         image: true,
         bio: true,
         skills: true,
         interests: true,
         createdAt: true,
         githubUrl: true,
         linkedinUrl: true,
         portfolioUrl: true
      }
   });

   if (!user?.username) {
      redirect("/onboarding");
   }

   return <DashboardContent user={user} />;
}