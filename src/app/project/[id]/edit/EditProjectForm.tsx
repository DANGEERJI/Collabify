// src/app/project/[id]/edit/EditProjectForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
   id: string;
   title: string;
   description: string;
   techStack: string[];
   tags: string[];
   githubUrl: string | null;
   estimatedTeamSize: number | null;
   status: string;
   goals?: string | null;
   requirements?: string | null;
}

interface EditProjectFormProps {
   project: Project;
}

const COMMON_TECH_STACK = [
   "React", "Next.js", "Vue.js", "Angular", "JavaScript", "TypeScript", "Node.js", "Express",
   "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET", "PHP", "Laravel",
   "Ruby", "Rails", "Go", "Rust", "Swift", "Kotlin", "Flutter", "React Native",
   "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase",
   "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Git", "GitHub", "GitLab"
];

const COMMON_TAGS = [
   "Web Development", "Mobile App", "AI/ML", "Data Science", "Game Development",
   "E-commerce", "Social Media", "Education", "Healthcare", "Finance", "Productivity",
   "Open Source", "Startup", "Portfolio", "Learning Project", "Hackathon",
   "Full Stack", "Frontend", "Backend", "DevOps", "UI/UX Design"
];

const PROJECT_STATUSES = [
   { value: "active", label: "Active" },
   { value: "completed", label: "Completed" },
   { value: "on-hold", label: "On Hold" },
   { value: "cancelled", label: "Cancelled" }
];

export default function EditProjectForm({ project }: EditProjectFormProps) {
   const router = useRouter();
   const [formData, setFormData] = useState({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      tags: project.tags,
      githubUrl: project.githubUrl || "",
      estimatedTeamSize: project.estimatedTeamSize || "",
      status: project.status,
      goals: project.goals || "",
      requirements: project.requirements || ""
   });

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleTechStackChange = (tech: string) => {
      setFormData(prev => ({
         ...prev,
         techStack: prev.techStack.includes(tech)
         ? prev.techStack.filter(t => t !== tech)
         : [...prev.techStack, tech]
      }));
   };

   const handleTagChange = (tag: string) => {
      setFormData(prev => ({
         ...prev,
         tags: prev.tags.includes(tag)
         ? prev.tags.filter(t => t !== tag)
         : [...prev.tags, tag]
      }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         const response = await fetch(`/api/projects/${project.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            ...formData,
            estimatedTeamSize: formData.estimatedTeamSize ? parseInt(formData.estimatedTeamSize as string) : null
         })
         });

         if (response.ok) {
         router.push(`/project/${project.id}`);
         router.refresh();
         } else {
         const data = await response.json();
         alert(data.error || "Failed to update project");
         }
      } catch (error) {
         console.error("Error updating project:", error);
         alert("An error occurred while updating the project");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDelete = async () => {
      setIsDeleting(true);

      try {
         const response = await fetch(`/api/projects/${project.id}`, {
         method: "DELETE"
         });

         if (response.ok) {
         router.push("/dashboard");
         router.refresh();
         } else {
         const data = await response.json();
         alert(data.error || "Failed to delete project");
         }
      } catch (error) {
         console.error("Error deleting project:", error);
         alert("An error occurred while deleting the project");
      } finally {
         setIsDeleting(false);
         setShowDeleteModal(false);
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
         <form onSubmit={handleSubmit} className="space-y-6">
         {/* Title */}
         <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
               Project Title *
            </label>
            <input
               type="text"
               id="title"
               name="title"
               value={formData.title}
               onChange={handleInputChange}
               required
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="Enter your project title"
            />
         </div>

         {/* Description */}
         <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
               Project Description *
            </label>
            <textarea
               id="description"
               name="description"
               value={formData.description}
               onChange={handleInputChange}
               required
               rows={4}
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
               placeholder="Describe your project, its goals, and what you're trying to build"
            />
         </div>

         {/* Goals */}
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

         {/* Tech Stack */}
         <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
               Tech Stack *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
               {COMMON_TECH_STACK.map((tech) => (
               <button
                  key={tech}
                  type="button"
                  onClick={() => handleTechStackChange(tech)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                     formData.techStack.includes(tech)
                     ? "bg-blue-600 text-white"
                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
               >
                  {tech}
               </button>
               ))}
            </div>
            {formData.techStack.length === 0 && (
               <p className="text-red-500 text-sm mt-2">Please select at least one technology</p>
            )}
         </div>

         {/* Tags */}
         <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
               Project Categories *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
               {COMMON_TAGS.map((tag) => (
               <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagChange(tag)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                     formData.tags.includes(tag)
                     ? "bg-purple-600 text-white"
                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
               >
                  {tag}
               </button>
               ))}
            </div>
            {formData.tags.length === 0 && (
               <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
            )}
         </div>

         {/* GitHub URL and Team Size */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label htmlFor="githubUrl" className="block text-sm font-semibold text-gray-900 mb-2">
               GitHub Repository URL
               </label>
               <input
               type="url"
               id="githubUrl"
               name="githubUrl"
               value={formData.githubUrl}
               onChange={handleInputChange}
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="https://github.com/username/repo"
               />
            </div>

            <div>
               <label htmlFor="estimatedTeamSize" className="block text-sm font-semibold text-gray-900 mb-2">
               Estimated Team Size
               </label>
               <input
               type="number"
               id="estimatedTeamSize"
               name="estimatedTeamSize"
               value={formData.estimatedTeamSize}
               onChange={handleInputChange}
               min="1"
               max="20"
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="e.g. 3"
               />
            </div>
         </div>

         {/* Status */}
         <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
               Project Status
            </label>
            <select
               id="status"
               name="status"
               value={formData.status}
               onChange={handleInputChange}
               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
               {PROJECT_STATUSES.map((status) => (
               <option key={status.value} value={status.value}>
                  {status.label}
               </option>
               ))}
            </select>
         </div>

         {/* Submit Buttons */}
         <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
               type="submit"
               disabled={isSubmitting || formData.techStack.length === 0 || formData.tags.length === 0}
               className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isSubmitting ? "Updating..." : "Update Project"}
            </button>
            
            <button
               type="button"
               onClick={() => router.push(`/project/${project.id}`)}
               className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
               Cancel
            </button>
            
            <button
               type="button"
               onClick={() => setShowDeleteModal(true)}
               className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
               Delete Project
            </button>
         </div>
         </form>

         {/* Delete Confirmation Modal */}
         {showDeleteModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
               <h3 className="text-xl font-semibold text-gray-900 mb-4">
               Delete Project
               </h3>
               <p className="text-gray-600 mb-6">
               Are you sure you want to delete "{project.title}"? This action cannot be undone and will remove all associated data including team members and discussions.
               </p>
               <div className="flex gap-3">
               <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
               >
                  {isDeleting ? "Deleting..." : "Delete Project"}
               </button>
               </div>
            </div>
         </div>
         )}
      </div>
   );
}