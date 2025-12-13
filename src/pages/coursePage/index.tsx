import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, X, Search, ChevronDown, Check, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard';
import axiosInstance from '@/lib/axios';
import { Loader } from '@/components/shared/MentoraLoader';

// --- Sub-Component: Filter Section Header ---
const FilterSectionTitle = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

export default function CoursePage() {
  const navigate = useNavigate();

  // --- State ---
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Added visual search state

  // --- Fetch Data ---
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

        if (courseData.length > 0) {
          const prices = courseData.map((c: any) => c.price || 0);
          setPriceRange({ min: Math.min(...prices), max: Math.max(...prices) });
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

  // --- Helpers ---
  const getCategoryNameById = (id: string) => {
    const cat = categories.find((c) => c._id === id || c.id === id);
    return cat?.name || 'Uncategorized';
  };

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
    const topics = categories.map((c) => c.name || 'Uncategorized').filter(Boolean);
    return [...new Set(topics)].sort();
  }, [categories]);

  const globalMinPrice = useMemo(() => Math.min(...courses.map((c) => c.price || 0)), [courses]);
  const globalMaxPrice = useMemo(() => Math.max(...courses.map((c) => c.price || 0)), [courses]);

  // --- Handlers ---
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
    setSearchQuery('');
    setCurrentPage(1);
  };

  // --- Filtering Logic ---
  const filteredAndSortedCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const courseCategoryName = typeof course.category === 'string'
        ? course.category
        : getCategoryNameById(course.category);

      // Search Query Filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Topic Filter
      const matchesTopic = selectedTopics.length === 0 || selectedTopics.some((topic) => {
        const lowerTopic = topic.toLowerCase();
        return (
          (course.title || '').toLowerCase().includes(lowerTopic) ||
          courseCategoryName.toLowerCase().includes(lowerTopic)
        );
      });

      // Category Filter
      const matchesCategory = selectedCategory === 'All' || courseCategoryName === selectedCategory;

      // Instructor Filter
      const matchesInstructor = selectedInstructorIds.length === 0 || selectedInstructorIds.includes(course.instructorId);

      // Price Filter
      const price = course.price || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;

      return matchesTopic && matchesCategory && matchesInstructor && matchesPrice;
    });

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return result;
  }, [courses, selectedTopics, selectedCategory, selectedInstructorIds, priceRange, sortBy, categories, searchQuery]);

  // --- Pagination ---
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Reusable Filter Content (Used in Sidebar & Mobile Drawer) ---
  const FilterContent = () => (
    <div className="space-y-1">
      {/* Category Filter */}
      <FilterSectionTitle title="Category">
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                selectedCategory === cat ? 'bg-supperagent border-supperagent' : 'border-gray-300 bg-white group-hover:border-supperagent'
              }`}>
                {selectedCategory === cat && <Check size={12} className="text-white" />}
              </div>
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selectedCategory === cat}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="hidden"
              />
              <span className={`text-sm ${selectedCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSectionTitle>

      <div className="border-t border-gray-100 my-6" />

      {/* Price Filter */}
      <FilterSectionTitle title="Price Range">
        <div className="px-1">
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            step={5}
            value={priceRange.max}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-supperagent"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 font-medium">${globalMinPrice}</div>
            <span className="text-gray-400">-</span>
            <div className="px-3 py-1 bg-white border border-supperagent text-supperagent rounded text-sm font-bold">${priceRange.max}</div>
          </div>
        </div>
      </FilterSectionTitle>

      <div className="border-t border-gray-100 my-6" />

      {/* Instructor Filter */}
      <FilterSectionTitle title="Instructors">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {allInstructorOptions.map((inst) => (
            <label key={inst.id} className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                selectedInstructorIds.includes(inst.id) ? 'bg-supperagent border-supperagent' : 'border-gray-300 bg-white group-hover:border-supperagent'
              }`}>
                {selectedInstructorIds.includes(inst.id) && <Check size={12} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={selectedInstructorIds.includes(inst.id)}
                onChange={() => toggleInstructor(inst.id)}
                className="hidden"
              />
              <span className={`text-sm ${selectedInstructorIds.includes(inst.id) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {inst.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSectionTitle>

      <div className="pt-6 mt-6 border-t border-gray-100">
        <button
            onClick={resetFilters}
            className="w-full py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
            Reset Filters
        </button>
      </div>
    </div>
  );

  if (loading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="relative bg-slate-50 overflow-x-hidden">
      
       {/* --- Background Elements --- */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

      {/* --- Hero Section --- */}
      <div className="relative bg-white border-b border-gray-200 z-10">
        <div className="container mx-auto  py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Explore Our <span className="text-supperagent">Courses</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              Discover a world of knowledge with our expert-led courses. Filter by category, price, or instructor to find your perfect match.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                    type="text"
                    placeholder="Search courses, skills, or teachers..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-supperagent/20 focus:border-supperagent focus:bg-white transition-all shadow-sm"
                />
            </div>
          </div>
        </div>
      </div>

      
      <div className="container mx-auto  py-8 md:py-12 relative z-10">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl shadow-sm font-medium"
          >
            <Filter size={18} />
            Filters & Sort
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* --- Desktop Sidebar Filters --- */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                    <Sliders size={18} className="text-supperagent" />
                    <span className="font-bold text-gray-900">Filters</span>
               </div>
               <FilterContent />
            </div>
          </aside>

          {/* --- Results Area --- */}
          <main className="flex-1">
            
            {/* Sort & Count Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                     <h2 className="text-xl font-bold text-gray-900">
                        {searchQuery ? `Search results for "${searchQuery}"` : 'All Courses'}
                     </h2>
                     <p className="text-sm text-gray-500 mt-1">
                        Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} results
                     </p>
                </div>
                
                <div className="relative group">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                className="appearance-none bg-white border border-gray-200 text-gray-900 py-2.5 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-supperagent/20 focus:border-supperagent shadow-sm text-sm font-medium min-w-[180px]"
                            >
                                <option value="default">Most Relevant</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Topics Chips (Horizontal Scroll) */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                 <div className="flex gap-2">
                    {allTopics.map(topic => (
                         <button
                         key={topic}
                         onClick={() => toggleTopic(topic)}
                         className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                           selectedTopics.includes(topic)
                             ? 'bg-gray-900 text-white border-gray-900'
                             : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                         }`}
                       >
                         {topic}
                       </button>
                    ))}
                 </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <CourseCard
                    key={course._id || course.id}
                    course={course}
                    onClick={() => navigate(`/courses/${course._id || course.id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                   </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    We couldn't find any courses matching your filters. Try adjusting your search or resetting the filters.
                  </p>
                  <button onClick={resetFilters} className="text-supperagent font-bold hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &lsaquo;
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
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-supperagent text-white shadow-md shadow-supperagent/25'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
                   className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- Mobile Filters Drawer --- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl transform transition-transform overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 py-3 bg-supperagent text-white rounded-xl font-bold shadow-lg shadow-supperagent/20"
              >
                Show {filteredAndSortedCourses.length} Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}