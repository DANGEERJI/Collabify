//src/app/api/user/profile/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
   const session = await getServerSession(authOptions);
   
   if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   try {
      const user = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: {
         id: true,
         username: true,
         name: true,
         email: true,
         bio: true,
         skills: true,
         interests: true,
         githubUrl: true,
         linkedinUrl: true,
         portfolioUrl: true,
         createdAt: true,
         },
      });

      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
   } catch (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
         { error: "Failed to fetch user profile" },
         { status: 500 }
      );
   }
}