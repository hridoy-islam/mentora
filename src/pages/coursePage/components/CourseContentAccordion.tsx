import React, { useState, useRef } from 'react';
import { ChevronDown, PlayCircle, FileText, HelpCircle, CircleHelp } from 'lucide-react';

// 1. Updated Helper: Handles "100" (minutes) strings correctly
const formatDuration = (durationInput: string | number) => {
  if (!durationInput) return '—';
  
  // Parse the input as an integer (handling "100" string)
  const totalMinutes = parseInt(String(durationInput), 10);

  if (isNaN(totalMinutes)) return '—';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

// 2. New Helper: Returns the correct icon based on lesson type
const getLessonIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'doc':
      return <FileText size={18} className="text-emerald-600" />;
    case 'quiz':
      return <CircleHelp size={18} className="text-orange-500" />;
    case 'video':
    default:
      return <PlayCircle size={18} className="text-blue-600" />;
  }
};

export default function CourseContentAccordion({ sections = [] }) {
  // Initialize with the first section open
  const [openSections, setOpenSections] = useState(new Set([0])); 
  const sectionRefs = useRef([]);

  const toggleSection = (index) => {
    const newOpenSections = new Set(openSections);
    let justOpened = false;

    if (newOpenSections.has(index)) {
      newOpenSections.delete(index);
    } else {
      newOpenSections.add(index);
      justOpened = true;
    }
    setOpenSections(newOpenSections);

    if (justOpened) {
      setTimeout(() => {
        sectionRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  };

  return (
    <div id="course-content" className="w-full">
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isOpen = openSections.has(index);
          
          // Determine the list of lessons (handling potential naming differences)
          const lessons = section.lessonsList || section.items || [];
          
          // Calculate total duration for the Section Header automatically
          const sectionTotalMinutes = lessons.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);

          return (
            <div 
              key={index} 
              ref={el => sectionRefs.current[index] = el}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 text-lg">{section.title}</h4>
                  <span className="text-sm text-gray-500 font-medium mt-1 block">
                    {lessons.length} lessons • {formatDuration(sectionTotalMinutes)}
                  </span>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-gray-50/50 p-2 border-t border-gray-100">
                  <ul className="space-y-1">
                    {lessons.map((lesson) => (
                      <li 
                        key={lesson._id} // Using _id from your JSON
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="text-xs text-gray-400 font-semibold flex-shrink-0 ml-4 bg-gray-100 px-2 py-1 rounded">
                            {lesson.type}
                          </div>
                          <span className="text-gray-700 font-medium truncate group-hover:text-supperagent transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold flex-shrink-0 ml-4 bg-gray-100 px-2 py-1 rounded">
                          {formatDuration(lesson.duration)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}