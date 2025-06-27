import { User } from "@prisma/client";
import { SetStateAction, useState } from "react";
import { Dispatch } from "react";


interface TeamMember {
   id: string;
   user: User;
   role?: string;
  // Add other member properties as needed
}

interface TeamMemberMenuProps {
   member: TeamMember;
   isOwner: boolean;
   setOpenMenuId: Dispatch<SetStateAction<string | null>>;
   onViewProfile: (user: User) => void;
   onRemoveMember: (member: TeamMember) => void;
}

// Team Member Card Menu Component
export const TeamMemberMenu: React.FC<TeamMemberMenuProps> = ({ 
   member, 
   isOwner, 
   onViewProfile, 
   onRemoveMember,
   setOpenMenuId
   }) => {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   
   const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
      setOpenMenuId(isOpen ? null : member.id);
   };
   
   const handleViewProfile = () => {
      onViewProfile(member.user);
      setIsOpen(false);
      setOpenMenuId(null);
   };
   
   const handleRemoveMember = () => {
      onRemoveMember(member);
      setIsOpen(false);
      setOpenMenuId(null);
   };
   
   return (
      <div className="relative">
         <button
         onClick={handleMenuToggle}
         className="p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
         aria-label="More options"
         >
         <svg
            className="w-4 h-4 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
         >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
         </svg>
         </button>
         {isOpen && (
         <>
            {/* Backdrop */}
            <div
               className="fixed inset-0 z-10"
               onClick={() => {
               setIsOpen(false);
               setOpenMenuId(null);
               }}
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
               <button
               onClick={handleViewProfile}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
               >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
               View Profile
               </button>
               
               {isOwner && (
               <>
                  <hr className="my-1" />
                  <button
                     onClick={handleRemoveMember}
                     className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     Remove from Team
                  </button>
               </>
               )}
            </div>
         </>
         )}
      </div>
   );
};