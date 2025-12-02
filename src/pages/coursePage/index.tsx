import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard';
import axiosInstance from '@/lib/axios';

export default function CoursePage() {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes, instructorsRes] = await Promise.all([
          axiosInstance.get('/courses'),
          axiosInstance.get('/category'),
          axiosInstance.get('/users', { params: { role: 'instructor', limit: 'all' } }),
        ]);

        const courseData = coursesRes.data.data.result || [];
        setCourses(courseData);

        const categoryData = categoriesRes.data.data.result || [];
        setCategories(categoryData);

        const instructorData = instructorsRes.data.data.result || instructorsRes.data.data || [];
        setInstructors(instructorData);

        // Set price range
        if (courseData.length > 0) {
          const prices = courseData.map((c) => c.price || 0);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange({ min, max });
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load course data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === Helper: Map category ID to name ===
  const getCategoryNameById = (id: string) => {
    const cat = categories.find((c) => c._id === id || c.id === id);
    return cat?.name || 'Uncategorized';
  };

  // === Derived Data ===
  const allCategories = useMemo(() => {
    const cats = categories.map((c) => c.name).filter(Boolean);
    return ['All', ...cats.sort()];
  }, [categories]);

  const allInstructorOptions = useMemo(() => {
    return instructors
      .filter((inst) => inst.name || inst.realName)
      .map((inst) => ({
        id: inst._id || inst.id,
        name: inst.realName || inst.name || 'Instructor',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [instructors]);

  const allTopics = useMemo(() => {
    const topics = categories
      .map((c) =>
        c.name || 'Uncategorized'
      )
      .filter(Boolean);
    return [...new Set(topics)].sort();
  }, [courses, categories]);

  const globalMinPrice = useMemo(() => Math.min(...courses.map((c) => c.price || 0)), [courses]);
  const globalMaxPrice = useMemo(() => Math.max(...courses.map((c) => c.price || 0)), [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      setPriceRange({ min: globalMinPrice, max: globalMaxPrice });
    }
  }, [globalMinPrice, globalMaxPrice, courses.length]);

  // === Filter Handlers ===
  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setCurrentPage(1);
  };

  const toggleInstructor = (instructorId: string) => {
    setSelectedInstructorIds((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedTopics([]);
    setSelectedCategory('All');
    setSelectedInstructorIds([]);
    setPriceRange({ min: globalMinPrice, max: globalMaxPrice });
    setCurrentPage(1);
  };

  // === Filtering & Sorting ===
  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter((course) => {
      // Resolve category name for comparison
      const courseCategoryName =
        typeof course.category === 'string'
          ? course.category
          : getCategoryNameById(course.category);

      // Topic filter: match title or resolved category name
      const matchesTopic =
        selectedTopics.length === 0 ||
        selectedTopics.some((topic) => {
          const lowerTopic = topic.toLowerCase();
          return (
            (course.title || '').toLowerCase().includes(lowerTopic) ||
            courseCategoryName.toLowerCase().includes(lowerTopic)
          );
        });

      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || courseCategoryName === selectedCategory;

      // Instructor filter (by ID)
      const matchesInstructor =
        selectedInstructorIds.length === 0 ||
        selectedInstructorIds.includes(course.instructorId);

      // Price filter
      const price = course.price || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;

      return matchesTopic && matchesCategory && matchesInstructor && matchesPrice;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return result;
  }, [
    courses,
    selectedTopics,
    selectedCategory,
    selectedInstructorIds,
    priceRange,
    sortBy,
    categories,
  ]);

  // === Pagination ===
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectCourse = (courseId: string) => navigate(`/courses/${courseId}`);

  // === Render ===
  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-supperagent text-white py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-4">Explore Courses</h1>
        </div>
      </div>

      <div className="container mx-auto py-12 relative">
        {/* Topics */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore Topics</h3>
          <div className="flex flex-wrap gap-3">
            {allTopics.map((topic) => (
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200 z-50">
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
            paginatedCourses.map((course) => (
              <CourseCard
                key={course._id || course.id}
                course={course}
                onClick={() => handleSelectCourse(course._id || course.id)}
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

        {/* Filter Sidebar */}
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Instructor</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {allInstructorOptions.map((inst) => (
                    <label key={inst.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedInstructorIds.includes(inst.id)}
                        onChange={() => toggleInstructor(inst.id)}
                        className="rounded text-supperagent"
                      />
                      <span className="text-sm">{inst.name}</span>
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
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                  }
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