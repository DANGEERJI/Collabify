//src/app/api/user/onboarding/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
   const session = await getServerSession(authOptions);
   if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   const data = await req.json();
   const { username, bio, skills, interests, githubUrl, linkedinUrl, portfolioUrl } = data;

   if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 });
   }

   // Check for duplicate username
   const existingUser = await prisma.user.findUnique({
      where: { username },
   });

   if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
   }

   // Update user with onboarding info
   await prisma.user.update({
      where: { email: session.user.email },
      data: {
         username,
         bio,
         skills,
         interests,
         githubUrl,
         linkedinUrl,
         portfolioUrl,
      },
   });

   return NextResponse.json({ success: true });
}
