import Image from "next/image";
import { User } from "@prisma/client";
import Link from "next/link";


interface UserAvatarProps {
   user: User;
   size: "sm" | "md" | "lg";
}

export const UserAvatar = ({ user, size = "md"}: UserAvatarProps) => {
   const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-base",
      lg: "w-16 h-16 text-xl"
   };
   return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg`}>
         <Link href={`/users/${user.username}`}>
            {user.image ? (
               <Image 
                  src={user.image} 
                  alt={user.name || "User"}
                  width={size === "sm" ? 32 : size === "md" ? 48 : 64}
                  height={size === "sm" ? 32 : size === "md" ? 48 : 64}
                  className="rounded-full object-cover"
               />
            ) : (
               <span className="text-white font-semibold">
                  {user.name?.charAt(0) || "U"}
               </span>
            )}
         </Link>
      </div>
   );
};