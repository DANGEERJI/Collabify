// src/app/project/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ProjectDetailContent from "./ProjectDetailContent";

interface ProjectPageProps {
   params: {
      id: string;
   };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || !session.user.email) {
      redirect("/api/auth/signin");
   }

   const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
         creator: {
         select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
            bio: true,
            skills: true,
            githubUrl: true,
            linkedinUrl: true,
         }
         }
      }
   });

   if (!project) {
      notFound();
   }

   const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
         id: true,
         name: true,
         email: true,
         image: true,
         username: true,
         skills: true,
      }
   });

   if (!currentUser) {
      redirect("/onboarding");
   }

   const isOwner = project.createdBy === currentUser.id;

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <ProjectDetailContent 
         project={project} 
         currentUser={currentUser} 
         isOwner={isOwner}
         />
      </div>
   );
}