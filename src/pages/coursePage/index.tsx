import React, { useState, useMemo } from 'react';
import { Sliders, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard';
import { courses } from '@/lib/demoData';

export default function CoursePage() {
  const navigate = useNavigate();
  
  // State
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // === DYNAMIC DERIVED DATA ===
  const allCategories = useMemo(() => {
    const cats = [...new Set(courses.map(c => c.category))];
    return ['All', ...cats.sort()];
  }, []);

  const allInstructors = useMemo(() => {
    return [...new Set(courses.map(c => c.instructor))].sort();
  }, []);

const allTopics = useMemo(() => {
  const cats = [...new Set(courses.map(c => c.category))];
  return cats.sort(); // optional: sort alphabetically
}, []);


  // Auto-set price range based on data
  const globalMinPrice = useMemo(() => Math.min(...courses.map(c => c.price)), []);
  const globalMaxPrice = useMemo(() => Math.max(...courses.map(c => c.price)), []);
  
  // Initialize price range dynamically (only once)
  useState(() => {
    setPriceRange({ min: globalMinPrice, max: globalMaxPrice });
  });

  // === FILTER HANDLERS ===
  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
    setCurrentPage(1);
  };

  const toggleInstructor = (instructor) => {
    setSelectedInstructors(prev =>
      prev.includes(instructor) ? prev.filter(i => i !== instructor) : [...prev, instructor]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedTopics([]);
    setSelectedCategory('All');
    setSelectedInstructors([]);
    setPriceRange({ min: globalMinPrice, max: globalMaxPrice });
    setCurrentPage(1);
  };

  // === FILTERING & SORTING ===
  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter(course => {
      // Topic filter: match against title/category words (case-insensitive)
      const matchesTopic = selectedTopics.length === 0 || 
        selectedTopics.some(topic => {
          const lowerTopic = topic.toLowerCase();
          return (
            course.title.toLowerCase().includes(lowerTopic) ||
            course.category.toLowerCase().includes(lowerTopic)
          );
        });

      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesInstructor = selectedInstructors.length === 0 || selectedInstructors.includes(course.instructor);
      const matchesPrice = course.price >= priceRange.min && course.price <= priceRange.max;

      return matchesTopic && matchesCategory && matchesInstructor && matchesPrice;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [
    selectedTopics,
    selectedCategory,
    selectedInstructors,
    priceRange,
    sortBy,
    globalMinPrice,
    globalMaxPrice
  ]);

  // === PAGINATION ===
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectCourse = (courseId) => navigate(`/courses/${courseId}`);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-supperagent text-white py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-4">Explore Courses</h1>
          <p className="text-lg text-slate-200">
            Discover {courses.length} courses across all categories
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 relative">
        {/* Dynamic Topics Filter */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore Topics</h3>
          <div className="flex flex-wrap gap-3">
            {allTopics.map(topic => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-5 py-2.5 rounded-full border-2 font-medium transition-all ${
                  selectedTopics.includes(topic)
                    ? 'bg-supperagent text-white border-supperagent'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-supperagent'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Sliders size={18} />
            <span className="text-sm">All Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {paginatedCourses.length} of {filteredAndSortedCourses.length}
            </span>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">Sort by</span>
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm border-2 border-gray-300 rounded px-3 py-1.5 bg-white cursor-pointer font-medium"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {paginatedCourses.length > 0 ? (
            paginatedCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => handleSelectCourse(course.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses match your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              className={`w-10 h-10 flex items-center justify-center border-2 rounded font-bold ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-semibold ${
                    currentPage === page
                      ? 'bg-supperagent text-white'
                      : 'border-2 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              className={`w-10 h-10 flex items-center justify-center border-2 rounded font-bold ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              ›
            </button>
          </div>
        )}

        {/* DYNAMIC FILTER SIDEBAR */}
        {showFilters && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex justify-end">
            <div 
              className="w-full max-w-xs bg-white h-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Category</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Instructor</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {allInstructors.map(instructor => (
                    <label key={instructor} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedInstructors.includes(instructor)}
                        onChange={() => toggleInstructor(instructor)}
                        className="rounded text-supperagent"
                      />
                      <span className="text-sm">{instructor}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                  Price: ${priceRange.min} – ${priceRange.max}
                </h3>
                <input
                  type="range"
                  min={globalMinPrice}
                  max={globalMaxPrice}
                  step={5}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${globalMinPrice}</span>
                  <span>${globalMaxPrice}</span>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 mb-4"
              >
                Reset All Filters
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-2.5 bg-supperagent text-white rounded-lg font-medium hover:bg-opacity-90"
              >
                Apply Filters
              </button>
            </div>
            <div className="flex-1" onClick={() => setShowFilters(false)}></div>
          </div>
        )}
      </div>
    </div>
  );
}