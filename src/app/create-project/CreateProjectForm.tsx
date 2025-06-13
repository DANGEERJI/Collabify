"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
   title: string;
   description: string;
   techStack: string[];
   tags: string[];
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
      githubUrl: "",
      estimatedTeamSize: null,
   });

   const [techStackInput, setTechStackInput] = useState("");
   const [tagsInput, setTagsInput] = useState("");

   // Common tech stack suggestions
   const techSuggestions = [
      "React", "Next.js", "Node.js", "Python", "JavaScript", "TypeScript", 
      "Java", "C++", "Flutter", "React Native", "Vue.js", "Angular",
      "Express", "Django", "Flask", "Spring Boot", "MongoDB", "PostgreSQL",
      "MySQL", "Firebase", "AWS", "Docker", "Kubernetes", "GraphQL"
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

   const addTechStack = (tech: string) => {
      const trimmed = tech.trim();
      if (trimmed && !formData.techStack.includes(trimmed)) {
         setFormData(prev => ({
         ...prev,
         techStack: [...prev.techStack, trimmed]
         }));
      }
   };

   const removeTechStack = (tech: string) => {
      setFormData(prev => ({
         ...prev,
         techStack: prev.techStack.filter(t => t !== tech)
      }));
   };

   const addTag = (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !formData.tags.includes(trimmed)) {
         setFormData(prev => ({
         ...prev,
         tags: [...prev.tags, trimmed]
         }));
      }
   };

   const removeTag = (tag: string) => {
      setFormData(prev => ({
         ...prev,
         tags: prev.tags.filter(t => t !== tag)
      }));
   };

   const handleTechStackKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
         e.preventDefault();
         addTechStack(techStackInput);
         setTechStackInput("");
      }
   };

   const handleTagsKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
         e.preventDefault();
         addTag(tagsInput);
         setTagsInput("");
      }
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
            <div className="space-y-3">
               <input
               type="text"
               value={techStackInput}
               onChange={(e) => setTechStackInput(e.target.value)}
               onKeyDown={handleTechStackKeyPress}
               placeholder="Add technologies (press Enter or comma to add)..."
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
               />
               
               {/* Tech Stack Suggestions */}
               <div className="flex flex-wrap gap-2">
               {techSuggestions.filter(tech => !formData.techStack.includes(tech)).slice(0, 12).map((tech) => (
                  <button
                     key={tech}
                     type="button"
                     onClick={() => addTechStack(tech)}
                     className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                     + {tech}
                  </button>
               ))}
               </div>

               {/* Selected Tech Stack */}
               {formData.techStack.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                     <span
                     key={tech}
                     className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                     >
                     {tech}
                     <button
                        type="button"
                        onClick={() => removeTechStack(tech)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                     >
                        ×
                     </button>
                     </span>
                  ))}
               </div>
               )}
            </div>
         </div>

         {/* Tags */}
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
               Project Tags
            </label>
            <div className="space-y-3">
               <input
               type="text"
               value={tagsInput}
               onChange={(e) => setTagsInput(e.target.value)}
               onKeyDown={handleTagsKeyPress}
               placeholder="Add project categories (press Enter or comma to add)..."
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
               />
               
               {/* Tag Suggestions */}
               <div className="flex flex-wrap gap-2">
               {tagSuggestions.filter(tag => !formData.tags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                     key={tag}
                     type="button"
                     onClick={() => addTag(tag)}
                     className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                     + {tag}
                  </button>
               ))}
               </div>

               {/* Selected Tags */}
               {formData.tags.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                     <span
                     key={tag}
                     className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                     >
                     {tag}
                     <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-green-600 hover:text-green-800"
                     >
                        ×
                     </button>
                     </span>
                  ))}
               </div>
               )}
            </div>
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