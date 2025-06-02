//src/app/onboarding/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
   const session = await getServerSession(authOptions);
   
   if (!session?.user) {
      redirect("/auth/signin");
   }

   const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { username: true }
   });

   if (user?.username) {
      redirect("/");
   }

   return <OnboardingForm />;
}