//src/app/api/user/check-username/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
   try {
      const { username } = await req.json();

      if (!username || username.length < 3) {
         return NextResponse.json(
         { error: "Username must be at least 3 characters long" },
         { status: 400 }
         );
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
         where: { username },
      });

      if (existingUser) {
         return NextResponse.json(
         { error: "Username is already taken" },
         { status: 409 }
         );
      }

      return NextResponse.json({ available: true });
   } catch (error) {
      console.error("Username check error:", error);
      return NextResponse.json(
         { error: "Failed to check username availability" },
         { status: 500 }
      );
   }
}