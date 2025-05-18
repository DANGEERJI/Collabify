import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";

const handler = NextAuth({
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
   ],

   secret: process.env.NEXTAUTH_SECRET,
   adapter: PrismaAdapter(prisma),

   session: {
      strategy: "jwt", // forces use of JWT instead of default 'database' strategy
   },

   callbacks: {
      async jwt({ token, user }) {
         console.log("JWT callback", { token, user });
         if (user) {
            token.id = user.id;
            console.log("Check id: ");
            console.log(token.id);
            console.log(user.id);
         }
         return token;
      },
      async session({ session, token }) {
         console.log("SESSION callback", { session, token });
         if (session.user && token?.id) {
            session.user.id = token.id as string;
         } else {
            console.warn("session.user or token.id is undefined");
         }
         return session;
      },
   }
});

export { handler as GET, handler as POST };