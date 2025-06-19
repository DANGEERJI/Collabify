import { signOut } from "next-auth/react";
import { UserAvatar } from "../ui/UserAvatar";

interface User {
   id: string;
   name: string | null;
   email: string | null;
   username: string | null;
   image: string | null;
   bio: string | null;
   skills: string[];
   interests: string[];
   createdAt: Date;
   githubUrl: string | null;
   linkedinUrl: string | null;
   portfolioUrl: string | null;
}

interface HeaderProps {
   isDashBoard: boolean;
   user: User | null;
}

export const Header = ({ isDashBoard, user }: HeaderProps) => {
   const handleSignOut = () => {
      signOut({
         callbackUrl: '/',
         redirect: true,
      });
   };

   const handleDashboardClick = () => {
      window.location.href = '/dashboard';
   }

   return(
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               <div className="flex items-center space-x-4">
                  <button onClick={handleDashboardClick} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                     <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                     </div>
                     <h1 className="text-2xl font-bold text-gray-900">Collabify</h1>
                  </button>
                  {!isDashBoard && (
                     <div>
                        <span className="text-gray-300">|</span>
                        <button onClick={handleDashboardClick} className="text-gray-600 hover:text-gray-900 transition-colors">
                           Dashboard
                        </button>
                     </div>
                  )}
               </div>
               {user && (
                  <div className="flex items-center space-x-4">
                     <UserAvatar user={user} size="sm"/>
                     <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                     </div>
                     <button 
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                     >
                        Sign Out
                     </button>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
}