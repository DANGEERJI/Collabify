// src/app/project/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionUserToUser, type SessionUser } from "@/types";
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

   const currentUser = session?.user ? sessionUserToUser(session.user as SessionUser) : null;
   const isOwner = currentUser?.id === project.creator.id;

   return (
      <ProjectDetailContent
         project={project}
         currentUser={currentUser}
         isOwner={isOwner}
      />
   );
}