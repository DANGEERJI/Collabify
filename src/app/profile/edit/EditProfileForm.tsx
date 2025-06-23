// src/app/profile/edit/EditProfileForm.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/AppHeader';
import { User } from '@prisma/client';

import { 
   User2, 
   Mail, 
   Github, 
   Linkedin, 
   Globe, 
   Plus, 
   X, 
   Save,
   AlertCircle,
   CheckCircle
} from 'lucide-react';
import { useHardRefresh } from '@/hooks/useHardRefresh';
import { TechSkillSelector } from '@/components/ui/TechSkillSelector';

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
const PREDEFINED_INTERESTS = [
   "Open Source", "Startups", "Hackathons", "Freelancing", "Remote Work", "EdTech", "FinTech",
   "HealthTech", "Climate Tech", "Sustainability", "AI Ethics", "Social Impact", "Blockchain", "Web3",
   "Cryptocurrency", "Gaming", "Game Design", "Virtual Reality (VR)", "Augmented Reality (AR)", "Cybersecurity", "Quantum Computing",
   "Space Technology", "Robotics", "Internet of Things (IoT)", "Smart Cities", "Automation", "Product Design", "Entrepreneurship",
   "Product Management", "Content Creation", "Tech for Good", "Women in Tech", "Digital Art", "Creative Coding", "Music Technology",
   "Neuroscience", "Behavioral Science", "Psychology in Design", "Data Storytelling", "Digital Nomad Lifestyle", "Minimalism", "Personal Finance",
   "Self-improvement", "Learning How to Learn", "Public Speaking", "Community Building", "Leadership", "Collaboration", "Personal Branding",
   "Ethical Hacking", "Augmenting Education", "Research & Development", "AI Alignment", "Future of Work"
];


interface EditProfileFormProps {
   user: User;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
   const { sessionRefresh } = useHardRefresh();
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

   const [formData, setFormData] = useState({
      name: user.name || '',
      bio: user.bio || '',
      skills: user.skills || [],
      interests: user.interests || [],
      githubUrl: user.githubUrl || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
   });

   const [currentSkills, setCurrentSkills] = useState<string[]>(formData.skills);
   const [currentInterests, setCurrentInterests] = useState<string[]>(formData.interests);

   const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
   };

   useEffect(() => {
      setFormData(prev => ({
         ...prev,
         skills: currentSkills
      }));
   }, [currentSkills]);

   useEffect(() => {
      setFormData(prev => ({
         ...prev,
         interests: currentInterests
      }));
   }, [currentInterests]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage(null);

      try {
         const response = await fetch('/api/user/profile/edit', {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
         });

         const data = await response.json();

         if (response.ok) {
         setMessage({ type: 'success', text: 'Profile updated successfully!' });
         setTimeout(() => {
            sessionRefresh(`/users/${user.username}`);
         }, 1500);
         } else {
         setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
         }
      } catch (error) {
         setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <Header user={user} isDashBoard={false}/>
         <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
               {/* Header */}
               <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Edit Your Profile
                  </h1>
                  <p className="text-gray-600 text-lg">
                  Keep your profile updated to connect with the right collaborators
                  </p>
               </div>

               {/* Main Content */}
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <h2 className="text-2xl font-semibold text-white">
                     Profile Information
                  </h2>
                  <p className="text-blue-100 mt-1">
                     Update your details to showcase your skills and interests
                  </p>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-8">
                     {/* Message Display */}
                     {message && (
                     <div className={`flex items-center gap-2 p-4 rounded-lg ${
                        message.type === 'success' 
                           ? 'bg-green-50 text-green-800 border border-green-200' 
                           : 'bg-red-50 text-red-800 border border-red-200'
                     }`}>
                        {message.type === 'success' ? (
                           <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                           <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                     </div>
                     )}

                     {/* Profile Photo & Basic Info */}
                     <div className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                           {user.image ? (
                           <Image 
                              src={user.image} 
                              alt="Profile" 
                              width={96} 
                              height={96}
                              className="w-full h-full object-cover"
                           />
                           ) : (
                           <User2 className="w-12 h-12 text-white" />
                           )}
                        </div>
                     </div>

                     <div className="flex-1 space-y-6">
                        {/* Username (Read-only) */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                           Username
                           </label>
                           <div className="relative">
                           <User2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                           <input
                              type="text"
                              value={user.username || ''}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                           />
                           </div>
                           <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                           Email
                           </label>
                           <div className="relative">
                           <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                           <input
                              type="email"
                              value={user.email || ''}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                           />
                           </div>
                        </div>

                        {/* Name */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                           Full Name *
                           </label>
                           <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => handleInputChange('name', e.target.value)}
                           placeholder="Enter your full name"
                           required
                           className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                           />
                        </div>
                     </div>
                     </div>

                     {/* Bio */}
                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                     </label>
                     <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell others about yourself, your goals, and what you're passionate about..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                     />
                     <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                     </div>

                     {/* Skills */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                           Skills
                        </label>
                        <TechSkillSelector currentTags={currentSkills} setCurrentTags={setCurrentSkills} PREDEFINED_TAGS={PREDEFINED_SKILLS}/>
                     </div>

                     {/* Interests */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                           Interests
                        </label>
                        <TechSkillSelector currentTags={currentInterests} setCurrentTags={setCurrentInterests} PREDEFINED_TAGS={PREDEFINED_INTERESTS}/>
                     </div>

                     {/* Social Links */}
                     <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                        
                        {/* GitHub */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              GitHub URL
                           </label>
                           <div className="relative">
                              <Github className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                              type="url"
                              value={formData.githubUrl}
                              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                              placeholder="https://github.com/yourusername"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                           </div>
                        </div>

                        {/* LinkedIn */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              LinkedIn URL
                           </label>
                           <div className="relative">
                              <Linkedin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                              type="url"
                              value={formData.linkedinUrl}
                              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                              placeholder="https://linkedin.com/in/yourusername"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                           </div>
                        </div>

                        {/* Portfolio */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Portfolio URL
                           </label>
                           <div className="relative">
                              <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                              type="url"
                              value={formData.portfolioUrl}
                              onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                              placeholder="https://yourportfolio.com"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                           </div>
                        </div>
                     </div>

                        {/* Submit Button */}
                     <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                           type="submit"
                           disabled={isLoading}
                           className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isLoading ? (
                              <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                              </>
                           ) : (
                              <>
                              <Save className="w-5 h-5" />
                              Save Changes
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}