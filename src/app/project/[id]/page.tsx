// src/app/project/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectDetailContent from "./ProjectDetailContent";

interface ProjectPageProps {
   params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
   // Await the params object
   const { id } = await params;
   
   const session = await getServerSession(authOptions);

   const project = await prisma.project.findUnique({
      where: { id },
      include: {
         creator: true,
         interests: {
            include: {
               user: true,
            }
         },
         teamMembers:{
            include: {
               user: true,
            }
         },
      },
   });

   if (!project) {
      notFound();
   }

   const currentUser = await prisma.user.findUnique({
      where: { email: session?.user.email! },
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
         portfolioUrl: true,
         emailVerified: true,
         updatedAt: true,
      }
   });

   const isOwner = currentUser?.id === project.creator.id;

   return (
      <ProjectDetailContent
         project={project}
         currentUser={currentUser}
         isOwner={isOwner}
      />
   );
}