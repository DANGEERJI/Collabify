//src/app/api/projects/my-projects/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
   const session = await getServerSession(authOptions);
   if(!session?.user || !session.user.email) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
   }

   try {
      const projects = await prisma.project.findMany({
         where: {
            createdBy: session.user.id
         },
         orderBy: {
            createdAt: 'desc'
         }
      });

      if(!projects) {
         return NextResponse.json({error: "Couldnt find any project"}, {status: 404});
      }
      return NextResponse.json({
         success: true, 
         projects,
         count: projects.length
      });
   } catch (error) {
      console.error("Error fetching projects: ", error);
      return NextResponse.json(
         {error: "Failed to fetch projects"}, 
         {status: 500}
      );
   };
};