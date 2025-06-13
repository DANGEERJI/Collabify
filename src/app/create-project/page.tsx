import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateProjectForm from "./CreateProjectForm";

export default async function CreateProjectPage() {
   const session = await getServerSession(authOptions);

   if (!session) {
      redirect("/");
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         {/* Header */}
         <header className="bg-white shadow-sm border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
               </div>
               <h1 className="text-2xl font-bold text-gray-900">Collabify</h1>
               </div>
               
               <div className="flex items-center space-x-4">
                  <a 
                     href="/dashboard"
                     className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                     Back to Dashboard
                  </a>
               </div>
            </div>
         </div>
         </header>

         {/* Main Content */}
         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
               Create New Project 🚀
            </h2>
            <p className="text-gray-600">
               Share your project idea and find the perfect teammates to bring it to life!
            </p>
         </div>

         <CreateProjectForm />
         </main>
      </div>
   );
}