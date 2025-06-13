// src/types/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
   interface Session {
      user: {
         id: string;
         name?: string | null;
         email?: string | null;
         image?: string | null;
         username?: string | null;
      };
   }

   interface User {
      id: string;
      username?: string | null;
   }
}

declare module "next-auth/jwt" {
   interface JWT {
      id?: string;
      username?: string | null;
   }
}



// import NextAuth from "next-auth";

// declare module "next-auth" {
//    interface Session {
//       user: {
//          id: string; // Add `id` to the user type
//          username?: string | null;
//          name?: string | null;
//          email?: string | null;
//          image?: string | null;
//       };
//    }

//    interface User {
//       username?: string | null;
//       id: string; // Ensure User has an id (usually does)
//    }

//    interface JWT {
//       id?: string;
//    }
// }
