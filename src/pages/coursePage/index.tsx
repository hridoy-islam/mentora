import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, X, Search, ChevronDown, Check, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard';
import axiosInstance from '@/lib/axios';
import { Loader } from '@/components/shared/MedicareLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// --- Sub-Component: Filter Section Header ---
const FilterSectionTitle = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">
      {title}
    </h3>
    {children}
  </div>
);

export default function CoursePage() {
  const navigate = useNavigate();

  // --- 1. Data & Loading States ---
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12 });

  // --- 2. Filter States ---

  // UI States (Controlled inputs, does NOT trigger API)
  const [tempCategory, setTempCategory] = useState<string>('All');
  const [tempPrice, setTempPrice] = useState<number>(1000);
  const [tempSearchTerm, setTempSearchTerm] = useState('');

  // Active States (Used for API calls)
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePrice, setActivePrice] = useState<number>(1000);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  // Sort and Page (Trigger API immediately)
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(12);

  // UI Toggles
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- 3. Initial Data Fetch (Categories) ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/category');
        setCategories(res.data.data.result || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // --- 4. Main Course Fetch Function ---
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const apiParams: any = {
      
        page: currentPage,
        limit: entriesPerPage,
        sort: sortBy,
        minPrice: 0,
        maxPrice: activePrice
      };

      if (activeCategory !== 'All') {
        apiParams.category = activeCategory;
      }
      if (activeSearchTerm) {
        apiParams.searchTerm = activeSearchTerm;
      }

      const response = await axiosInstance.get('/courses', {
        params: apiParams
      });

      const result = response.data.data.result || [];
      setTotalPages(response.data.data.meta.totalPage);
      setMeta({ ...response.data.data.meta });
      setCourses(result);

    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Effect Hook ---
  // Triggers when Active Filters, Page, or Sort changes
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activePrice, activeSearchTerm, sortBy, currentPage]);

  // --- 6. Handlers ---

  // Handle Input Changes (Updates UI state only)
  const handleCategoryChange = (cat: string) => {
    setTempCategory(cat);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPrice(Number(e.target.value));
  };

  // Handle Actions (Updates Active state -> Triggers API)
  const handleApplyFilters = () => {
    setActiveCategory(tempCategory);
    setActivePrice(tempPrice);
    setCurrentPage(1); // Reset to page 1 on filter apply
    setShowMobileFilters(false);
  };

  const handleSearchClick = () => {
    setActiveSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    // Reset UI
    setTempCategory('All');
    setTempPrice(1000);
    setTempSearchTerm('');
    setSortBy('default');
    
    // Reset Active
    setActiveCategory('All');
    setActivePrice(1000);
    setActiveSearchTerm('');
    setCurrentPage(1);
  };

  // --- Memoized Categories List ---
  const allCategories = useMemo(() => {
    const cats = categories.map((c) => c.name).filter(Boolean);
    return ['All', ...cats.sort()];
  }, [categories]);

  // --- Render Components ---

  const FilterContent = () => (
    <div className="space-y-1">
      {/* Category Filter */}
      <FilterSectionTitle title="Category">
        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-2">
          {allCategories.map((cat) => (
            <label
              key={cat}
              className="group flex cursor-pointer items-center gap-3"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                  tempCategory === cat
                    ? 'border-supperagent bg-supperagent'
                    : 'border-gray-300 bg-white group-hover:border-supperagent'
                }`}
              >
                {tempCategory === cat && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <input
                type="radio"
                name="category"
                value={cat}
                checked={tempCategory === cat}
                onChange={() => handleCategoryChange(cat)}
                className="hidden"
              />
              <span
                className={`text-sm ${tempCategory === cat ? 'font-medium text-gray-900' : 'text-gray-600'}`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSectionTitle>

      <div className="my-6 border-t border-gray-100" />

      {/* Price Filter */}
      <FilterSectionTitle title="Max Price">
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={tempPrice}
            onChange={handlePriceChange}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-supperagent"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">
              $0
            </div>
            <span className="text-gray-400">-</span>
            <div className="rounded border border-supperagent bg-white px-3 py-1 text-sm font-bold text-supperagent">
              ${tempPrice}
            </div>
          </div>
        </div>
      </FilterSectionTitle>

      {/* Apply Button Section */}
      <div className="mt-8 space-y-3 pt-4">
        <button
          onClick={handleApplyFilters}
          className="w-full rounded-xl bg-supperagent py-3 text-sm font-bold text-white shadow-lg shadow-supperagent/20 transition-all hover:bg-supperagent/90 hover:shadow-xl active:scale-95"
        >
          Apply Filters
        </button>
        
        <button
          onClick={resetFilters}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
        >
          Reset All
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden bg-slate-50">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full bg-blue-100/40 blur-3xl" />

      {/* Hero Header */}
      <div className="relative z-10 border-b border-gray-200 bg-white">
        <div className="container mx-auto py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Explore Our <span className="text-supperagent">Courses</span>
            </h1>
            <p className="mb-8 text-lg text-gray-500">
              Discover a world of knowledge with our expert-led courses. Filter
              by category, price, or instructor to find your perfect match.
            </p>

            {/* Search Bar with Button */}
            <div className="relative flex max-w-lg items-center gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 shadow-sm transition-all focus:border-supperagent focus:bg-white focus:ring-2 focus:ring-supperagent/20"
                />
              </div>
              <Button
              size={'sm'}
                onClick={handleSearchClick}
                className="rounded-xl bg-supperagent px-6 h-9 font-bold text-white shadow-md shadow-supperagent/20 transition-all active:scale-95"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto py-8 md:py-12">
        {/* Mobile Filter Toggle */}
        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm"
          >
            <Filter size={18} />
            Filters & Sort
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Sliders size={18} className="text-supperagent" />
                <span className="font-bold text-gray-900">Filters</span>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1">
            {/* Header: Count & Sort */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeSearchTerm
                    ? `Results for "${activeSearchTerm}"`
                    : 'All Courses'}
                </h2>
               
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="min-w-[180px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-supperagent focus:outline-none focus:ring-2 focus:ring-supperagent/20"
                  >
                    <option value="default">Most Relevant</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : (
              <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard
                      key={course._id || course.id}
                      course={course}
                      onClick={() => navigate(`/courses/${course?.slug}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-3xl border border-gray-100 bg-white py-20 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                      <Search className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      No courses found
                    </h3>
                    <p className="mx-auto mb-6 max-w-sm text-gray-500">
                      We couldn't find any courses matching your filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="font-bold text-supperagent hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {meta.total > meta.limit && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &lsaquo;
                </button>

                <span className="px-4 font-medium text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs transform overflow-y-auto bg-white shadow-2xl transition-transform">
            <div className="p-6">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}