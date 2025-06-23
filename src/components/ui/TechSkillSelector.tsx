import { Dispatch, SetStateAction, useState } from "react";

interface TechSkillSelectorProps {
   currentTags: string[];
   setCurrentTags: Dispatch<SetStateAction<string[]>>;
   PREDEFINED_TAGS: string[];
}

export const TechSkillSelector = ({ currentTags, setCurrentTags, PREDEFINED_TAGS}: TechSkillSelectorProps) => {
   const [customTags, setCustomTags] = useState("");

   const toggleTags = (skill: string) => {
      setCurrentTags(prev => 
         prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
   };

   const addCustomTags = () => {
      const trimmedSkill = customTags.trim();
      if(trimmedSkill && !currentTags.includes(trimmedSkill)) {
         setCurrentTags([...currentTags, trimmedSkill]);
         setCustomTags("");
      }
   };

   const removeTags = (skillToRemove: string) => {
      setCurrentTags(prev => prev.filter(skill => skill !== skillToRemove));
   };

   return (
      <div>
         {/* Selected Skills */}
         {currentTags.length > 0 && (
            <div className="mb-4">
               <p className="text-sm text-gray-600 mb-2">Selected Skills ({currentTags.length}):</p>
               <div className="flex flex-wrap gap-2">
               {currentTags.map((skill) => (
                  <span
                     key={skill}
                     className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                  >
                     {skill}
                     <button
                     type="button"
                     onClick={() => removeTags(skill)}
                     className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                     >
                     ×
                     </button>
                  </span>
               ))}
               </div>
            </div>
         )}

         {/* Add Custom Skill */}
         <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Skill:</p>
            <div className="flex gap-2">
               <input
               type="text"
               value={customTags}
               onChange={(e) => setCustomTags(e.target.value)}
               placeholder="Type a skill and click Add"
               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               onKeyDown={(e) => (e.key === 'Enter' || e.key ===',') && (e.preventDefault(), addCustomTags())}
               />
               <button
               type="button"
               onClick={addCustomTags}
               disabled={!customTags.trim()}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
               Add
               </button>
            </div>
         </div>

         {/* Predefined Skills Grid */}
         <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Or choose from popular skills:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
               {PREDEFINED_TAGS.map((skill) => (
               <button
                  key={skill}
                  type="button"
                  onClick={() => toggleTags(skill)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left ${
                     currentTags.includes(skill)
                     ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                     : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
               >
                  {skill}
               </button>
               ))}
            </div>
         </div>
      </div>
   )
}