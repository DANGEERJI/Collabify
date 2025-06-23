// src/app/onboarding/OnboardingForm.tsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { TechSkillSelector } from "@/components/ui/TechSkillSelector";

const PREDEFINED_SKILLS = [
   "JavaScript", "Python", "React", "Next.js", "Node.js", "TypeScript", "Java",
   "C++", "C#", "HTML/CSS", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin",
   "Flutter", "React Native", "Vue.js", "Angular", "Express", "Express.js",
   "Django", "Flask", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET",
   "FastAPI", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "AWS",
   "Azure", "Google Cloud", "Docker", "Kubernetes", "Git", "Linux", "DevOps",
   "CI/CD", "Machine Learning", "Data Science", "AI", "Deep Learning",
   "TensorFlow", "PyTorch", "Data Analysis", "Statistics", "R", "Tableau",
   "Power BI", "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
   "Sketch", "Game Development", "Unity", "Unreal Engine", "Blender",
   "3D Modeling", "Mobile Development", "iOS Development", "Android Development",
   "Cross-platform", "Backend Development", "Frontend Development",
   "Full-stack Development", "API Development", "GraphQL", "REST APIs",
   "Microservices", "Blockchain", "Web3", "Solidity", "Cybersecurity",
   "Penetration Testing", "Network Security"
];


export default function OnboardingForm() {
   const [formData, setFormData] = useState({
      username: "",
      bio: "",
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
   });
   const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
   const [error, setError] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [isCheckingUsername, setIsCheckingUsername] = useState(false);
   const [usernameError, setUsernameError] = useState("");
   const { data: session } = useSession();

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      
      // Clear username error when user starts typing
      if (e.target.name === "username") {
         setUsernameError("");
      }
   };

   const checkUsernameAvailability = async (username: string) => {
      if (username.length < 3) {
         setUsernameError("Username must be at least 3 characters long");
         return;
      }

      setIsCheckingUsername(true);
      try {
         const res = await fetch("/api/user/check-username", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ username }),
         });
         const data = await res.json();
         
         if (!res.ok) {
         setUsernameError(data.error || "Error checking username");
         } else {
         setUsernameError(""); // Username is available
         }
      } catch (err) {
         setUsernameError("Error checking username availability");
      } finally {
         setIsCheckingUsername(false);
      }
   };

   const handleUsernameBlur = () => {
      if (formData.username) {
         checkUsernameAvailability(formData.username);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (usernameError) {
         setError("Please fix the username error before submitting");
         return;
      }

      setIsLoading(true);
      setError("");

      try {
         const payload = {
         username: formData.username,
         bio: formData.bio || null,
         skills: selectedSkills,
         interests: [], // You can add interests section later if needed
         githubUrl: formData.githubUrl || null,
         linkedinUrl: formData.linkedinUrl || null,
         portfolioUrl: formData.portfolioUrl || null,
         };

         const res = await fetch("/api/user/onboarding", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
         });

         const data = await res.json();

         if (res.ok) {
         // Force a hard redirect to dashboard after successful onboarding
         window.location.href = "/dashboard";
         } else {
         setError(data.error || "Something went wrong.");
         }
      } catch (err) {
         setError("Network error. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
         <div className="max-w-4xl mx-auto">
         {/* Header */}
         <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
               <span className="text-2xl text-white font-bold">🎯</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
               Welcome to Collabify, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 text-lg">
               Let's set up your profile so other students can discover your skills
            </p>
            <p className="text-sm text-gray-500 mt-2">
               Only username is required - you can add other details later
            </p>
         </div>

         {/* Form Card */}
         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
               {/* Username - Required */}
               <div>
               <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
               </label>
               <div className="relative">
                  <input
                     id="username"
                     name="username"
                     type="text"
                     required
                     value={formData.username}
                     onChange={handleChange}
                     onBlur={handleUsernameBlur}
                     placeholder="e.g., johndoe123"
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                     usernameError 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-500'
                     }`}
                  />
                  {isCheckingUsername && (
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                     </div>
                  )}
               </div>
               {usernameError && (
                  <p className="text-red-500 text-sm mt-1">{usernameError}</p>
               )}
               {!usernameError && formData.username.length >= 3 && !isCheckingUsername && (
                  <p className="text-green-500 text-sm mt-1">✓ Username is available</p>
               )}
               </div>

               {/* Skills Section */}
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                     Skills <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <TechSkillSelector currentTags={selectedSkills} setCurrentTags={setSelectedSkills} PREDEFINED_TAGS={PREDEFINED_SKILLS}/>
               </div>

               {/* Bio - Optional */}
               <div>
               <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio <span className="text-gray-400 font-normal">(Optional)</span>
               </label>
               <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your goals, and what you're passionate about..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
               />
               </div>

               {/* Links Section - Optional */}
               <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Your Links <span className="text-gray-400 font-normal text-sm">(Optional - can be added later)</span>
               </h3>
               
               <div className="grid md:grid-cols-2 gap-4">
                  {/* GitHub */}
                  <div>
                     <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                     GitHub Profile
                     </label>
                     <input
                     id="githubUrl"
                     name="githubUrl"
                     type="url"
                     value={formData.githubUrl}
                     onChange={handleChange}
                     placeholder="https://github.com/yourusername"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                     />
                  </div>

                  {/* LinkedIn */}
                  <div>
                     <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                     LinkedIn Profile
                     </label>
                     <input
                     id="linkedinUrl"
                     name="linkedinUrl"
                     type="url"
                     value={formData.linkedinUrl}
                     onChange={handleChange}
                     placeholder="https://linkedin.com/in/yourusername"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                     />
                  </div>
               </div>

               {/* Portfolio */}
               <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                     Portfolio Website
                  </label>
                  <input
                     id="portfolioUrl"
                     name="portfolioUrl"
                     type="url"
                     value={formData.portfolioUrl}
                     onChange={handleChange}
                     placeholder="https://yourportfolio.com"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  />
               </div>
               </div>

               {/* Error Message */}
               {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
               </div>
               )}

               {/* Submit Button */}
               <button
               type="submit"
               disabled={isLoading || !!usernameError || !formData.username}
               className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
               >
               {isLoading ? (
                  <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Creating your profile...
                  </>
               ) : (
                  "Complete Profile Setup"
               )}
               </button>
            </form>
         </div>

         {/* Footer */}
         <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
               Don't worry! You can always update your profile and add more details later
            </p>
         </div>
         </div>
      </div>
   );
}