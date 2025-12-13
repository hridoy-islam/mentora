import React, { useState, useRef } from 'react';
import { ChevronDown, PlayCircle } from 'lucide-react';

// Helper function to format duration string
const formatDuration = (duration: string) => {
  if (!duration) return '—';
  const parts = duration.split(':').map(Number);

  if (parts.length === 2) { // mm:ss
    const minutes = parts[0];
    const seconds = parts[1];
    return minutes > 0 ? `${minutes}min` : `${seconds}s`;
  } else if (parts.length === 3) { // hh:mm:ss
    const hours = parts[0];
    const minutes = parts[1];
    return hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`) : `${minutes}min`;
  } else {
    const mins = Number(duration);
    return isNaN(mins) ? '—' : `${mins}min`;
  }
};

export default function CourseContentAccordion({ sections }) {
  const [openSections, setOpenSections] = useState(new Set());
  const sectionRefs = useRef([]); // To store refs for scrolling

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
    <div id="course-content">
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isOpen = openSections.has(index);
          return (
            <div 
              key={index} 
              ref={el => sectionRefs.current[index] = el}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-gray-900 text-lg">{section.title}</h4>
                  <span className="text-sm text-gray-600 font-medium">
                    {section.lessons} lessons {"-"} {formatDuration(section.hours)}
                  </span>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isOpen && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <ul className="space-y-3">
                    {section.lessonsList.map((lesson) => (
                      <li key={lesson.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <PlayCircle size={18} className="text-blue-600" />
                          <span className="text-gray-700">{lesson.title}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-semibold">{formatDuration(lesson.duration)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
