// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
   interface Session {
      user: {
         id: string; // Add `id` to the user type
         name?: string | null;
         email?: string | null;
         image?: string | null;
      };
   }

   interface User {
      id: string; // Ensure User has an id (usually does)
   }

   interface JWT {
      id?: string;
   }
}
