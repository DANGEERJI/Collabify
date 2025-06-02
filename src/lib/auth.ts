//src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
   adapter: PrismaAdapter(prisma),
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
   ],
   secret: process.env.NEXTAUTH_SECRET,
   session: {
      strategy: "jwt",
   },
   pages: {
      signIn: "/", // Redirect to homepage instead of custom sign-in page
      // Remove the custom sign-in page from NextAuth config
   },
   callbacks: {
      jwt: async ({ token, user }) => {
         // First time - on sign-in
         if (user) {
         token.id = user.id;
         token.name = user.name ?? null;
         token.email = user.email ?? null;
         token.picture = user.image ?? null;
         token.username = user.username ?? null;
         }
         
         // Fetch from DB if username is missing (e.g., during token reuse)
         if (!token.username && token.id) {
         const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
         });
         if (dbUser) {
            token.username = dbUser.username ?? null;
            token.name = dbUser.name ?? null;
            token.email = dbUser.email ?? null;
            token.picture = dbUser.image ?? null;
         }
         }
         
         return token;
      },
      session: async ({ session, token }) => {
         if (session.user && token) {
         session.user.id = token.id as string;
         session.user.name = token.name ?? null;
         session.user.email = token.email ?? null;
         session.user.image = token.picture ?? null;
         session.user.username = token.username ?? null;
         }
         
         return session;
      },
      // Add redirect callback to handle post-signin routing
      redirect: async ({ url, baseUrl }) => {
         // If user is signing out, redirect to homepage
         if (url.includes('/api/auth/signout')) {
         return baseUrl;
         }
         
         // If it's a relative URL, make it absolute
         if (url.startsWith('/')) {
         return `${baseUrl}${url}`;
         }
         
         // If it's the same origin, allow it
         if (new URL(url).origin === baseUrl) {
         return url;
         }
         
         // Default to homepage
         return baseUrl;
      },
   },
};