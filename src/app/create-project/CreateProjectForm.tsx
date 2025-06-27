"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TechSkillSelector } from "@/components/ui/TechSkillSelector";

interface FormData {
   title: string;
   description: string;
   techStack: string[];
   tags: string[];
   goals: string;
   requirements: string;
   githubUrl: string;
   estimatedTeamSize: number | null;
}

export default function CreateProjectForm() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   
   const [formData, setFormData] = useState<FormData>({
      title: "",
      description: "",
      techStack: [],
      tags: [],
      goals: "",
      requirements: "",
      githubUrl: "",
      estimatedTeamSize: null,
   });

   const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
   const [selectedTags, setSeletedTags] = useState<string[]>([]);

   useEffect(() => {
      setFormData(prev => ({
         ...prev,
         techStack: selectedSkills
      }));
   }, [selectedSkills]);

   useEffect(() => {
      setFormData(prev => ({
         ...prev,
         tags: selectedTags
      }));
   }, [selectedTags]);

   // Common tech stack suggestions
const techSuggestions= [
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

   // Common project tags
   const tagSuggestions = [
      "Web Development", "Mobile App", "AI/ML", "Data Science", "Game Development",
      "E-commerce", "Social Media", "Education", "Healthcare", "Finance",
      "Open Source", "Startup Idea", "Academic Project", "Portfolio Project"
   ];

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: name === "estimatedTeamSize" ? (value ? parseInt(value) : null) : value
      }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
         const response = await fetch("/api/projects", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(formData),
         });

         const data = await response.json();

         if (!response.ok) {
         throw new Error(data.error || "Failed to create project");
         }

         // Redirect to dashboard with success message
         router.push("/dashboard?created=true");
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to create project");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
         <form onSubmit={handleSubmit} className="space-y-8">
         {/* Title */}
         <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
               Project Title *
            </label>
            <input
               type="text"
               id="title"
               name="title"
               required
               value={formData.title}
               onChange={handleInputChange}
               placeholder="Enter your project title..."
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
         </div>

         {/* Description */}
         <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
               Project Description *
            </label>
            <textarea
               id="description"
               name="description"
               required
               rows={5}
               value={formData.description}
               onChange={handleInputChange}
               placeholder="Describe your project, its goals, and what you hope to achieve..."
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
            />
         </div>

         {/* Tech Stack */}
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
               Tech Stack
            </label>
            <TechSkillSelector currentTags={selectedSkills} setCurrentTags={setSelectedSkills} PREDEFINED_TAGS={techSuggestions}/>
         </div>

         {/* Tags */}
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
               Project Tags
            </label>
            <TechSkillSelector currentTags={selectedTags} setCurrentTags={setSeletedTags} PREDEFINED_TAGS={tagSuggestions}/>
         </div>

         <div>
            <label htmlFor="goals" className="block text-sm font-semibold text-gray-900 mb-2">
               Project Goals
            </label>
            <textarea
               id="goals"
               name="goals"
               value={formData.goals}
               onChange={handleInputChange}
               rows={3}
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
               placeholder="What are the main objectives and milestones for this project?"
            />
         </div>

         {/* Requirements */}
         <div>
            <label htmlFor="requirements" className="block text-sm font-semibold text-gray-900 mb-2">
               Team Requirements
            </label>
            <textarea
               id="requirements"
               name="requirements"
               value={formData.requirements}
               onChange={handleInputChange}
               rows={3}
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
               placeholder="What skills, experience, or commitments are you looking for in team members?"
            />
         </div>

         {/* GitHub URL */}
         <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
               GitHub Repository (Optional)
            </label>
            <input
               type="url"
               id="githubUrl"
               name="githubUrl"
               value={formData.githubUrl}
               onChange={handleInputChange}
               placeholder="https://github.com/username/repository"
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
         </div>

         {/* Estimated Team Size */}
         <div>
            <label htmlFor="estimatedTeamSize" className="block text-sm font-medium text-gray-700 mb-2">
               Estimated Team Size (Optional)
            </label>
            <select
               id="estimatedTeamSize"
               name="estimatedTeamSize"
               value={formData.estimatedTeamSize || ""}
               onChange={handleInputChange}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
               <option value="">Select team size...</option>
               <option value="2">2 members</option>
               <option value="3">3 members</option>
               <option value="4">4 members</option>
               <option value="5">5 members</option>
               <option value="6">6 members</option>
               <option value="7">7+ members</option>
            </select>
         </div>

         {/* Error Message */}
         {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
               <p className="text-red-700 text-sm">{error}</p>
            </div>
         )}

         {/* Submit Button */}
         <div className="flex justify-end space-x-4">
            <button
               type="button"
               onClick={() => router.back()}
               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
               Cancel
            </button>
            <button
               type="submit"
               disabled={loading}
               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Creating..." : "Create Project"}
            </button>
         </div>
         </form>
      </div>
   );
}