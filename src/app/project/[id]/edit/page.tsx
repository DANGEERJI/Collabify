// src/app/project/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditProjectForm from "./EditProjectForm";

interface EditProjectPageProps {
   params: {
      id: string;
   };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
   const session = await getServerSession(authOptions);
   
   if (!session?.user || !session.user.email) {
      redirect("/api/auth/signin");
   }

   const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
   });

   if (!currentUser) {
      redirect("/onboarding");
   }

   const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
         creator: {
         select: { id: true, name: true }
         }
      }
   });

   if (!project) {
      notFound();
   }

   // Check if current user owns the project
   if (project.createdBy !== currentUser.id) {
      redirect(`/project/${params.id}`);
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <div className="container mx-auto px-4 py-8 max-w-4xl">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Project</h1>
            <p className="text-gray-600">Update your project details and settings</p>
         </div>
         
         <EditProjectForm project={project} />
         </div>
      </div>
   );
}