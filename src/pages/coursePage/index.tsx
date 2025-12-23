import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  X,
  Search,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard';
import axiosInstance from '@/lib/axios';
import { Loader } from '@/components/shared/MedicareLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

// --- EXTRACTED COMPONENT: This prevents the focus loss issue ---
interface FilterSidebarProps {
  categories: any[];
  tempCategory: string;
  setTempCategory: (id: string) => void;
  tempMinPrice: number | '';
  setTempMinPrice: (val: number | '') => void;
  tempMaxPrice: number | '';
  setTempMaxPrice: (val: number | '') => void;
  handleApplyFilters: () => void;
  resetFilters: () => void;
}

const FilterSidebar = ({
  categories,
  tempCategory,
  setTempCategory,
  tempMinPrice,
  setTempMinPrice,
  tempMaxPrice,
  setTempMaxPrice,
  handleApplyFilters,
  resetFilters
}: FilterSidebarProps) => {
  // Safe handler for inputs to allow clearing the field
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTempMinPrice(val === '' ? '' : Number(val));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTempMaxPrice(val === '' ? '' : Number(val));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempMaxPrice(Number(e.target.value));
  };

  return (
    <div className="space-y-1">
      <FilterSectionTitle title="Category">
        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="group flex cursor-pointer items-center gap-3"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                  tempCategory === cat.id
                    ? 'border-supperagent bg-supperagent'
                    : 'border-gray-300 bg-white group-hover:border-supperagent'
                }`}
              >
                {tempCategory === cat.id && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={tempCategory === cat.id}
                onChange={() => setTempCategory(cat.id)}
                className="hidden"
              />
              <span
                className={`text-sm ${
                  tempCategory === cat.id
                    ? 'font-medium text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSectionTitle>

      <div className="my-6 border-t border-gray-100" />

      <FilterSectionTitle title="Price Range ($)">
        <div className="space-y-4 px-1">
          {/* Manual Input Fields */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={tempMinPrice}
                onChange={handleMinChange}
                className="h-9 px-2 text-center text-sm"
                placeholder="Min"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
              <Input
                type="number"
                value={tempMaxPrice}
                onChange={handleMaxChange}
                className="h-9 px-2 text-center text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Range Slider for Max Price */}
          <div className="pt-2">
            <input
              type="range"
              min={0}
              max={2000}
              step={10}
              value={Number(tempMaxPrice) || 0}
              onChange={handleSliderChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-supperagent transition-colors hover:bg-gray-300"
            />
            <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
              <span>$0</span>
              <span>$2000+</span>
            </div>
          </div>
        </div>
      </FilterSectionTitle>

      <div className="mt-8 space-y-3 pt-4">
        <button
          onClick={handleApplyFilters}
          className="w-full rounded-xl bg-supperagent py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-supperagent/90 active:scale-95"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CoursePage() {
  const navigate = useNavigate();

  // --- 1. Data & Loading States ---
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12 });

  // --- 2. Filter States ---

  // UI States (Allow empty string for inputs while typing)
  const [tempCategory, setTempCategory] = useState<string>('All');
  const [tempMinPrice, setTempMinPrice] = useState<number | ''>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | ''>(1000);
  const [tempSearchTerm, setTempSearchTerm] = useState('');

  // Active States (Used for API calls - strictly numbers)
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeMinPrice, setActiveMinPrice] = useState<number>(0);
  const [activeMaxPrice, setActiveMaxPrice] = useState<number>(1000);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  // Sort and Page
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entriesPerPage] = useState(9);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- 3. Data Fetching ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/category?limit=all');
        setCategories(res.data.data.result || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const apiParams: any = {
        page: currentPage,
        limit: entriesPerPage,
        sort: sortBy,
        minPrice: activeMinPrice,
        maxPrice: activeMaxPrice
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
      setTotal(response.data.data.meta.total);
      setMeta({ ...response.data.data.meta });
      setCourses(result);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [
    activeCategory,
    activeMinPrice,
    activeMaxPrice,
    activeSearchTerm,
    sortBy,
    currentPage
  ]);

  // --- 4. Handlers ---
  const handleApplyFilters = () => {
    setActiveCategory(tempCategory);
    // Ensure we don't send empty string to API
    setActiveMinPrice(tempMinPrice === '' ? 0 : tempMinPrice);
    setActiveMaxPrice(tempMaxPrice === '' ? 0 : tempMaxPrice);
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  const handleSearchClick = () => {
    setActiveSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTempCategory('All');
    setTempMinPrice(0);
    setTempMaxPrice(1000);
    setTempSearchTerm('');
    setSortBy('default');

    setActiveCategory('All');
    setActiveMinPrice(0);
    setActiveMaxPrice(1000);
    setActiveSearchTerm('');
    setCurrentPage(1);
  };

  // Memoized categories
  const allCategories = useMemo(() => {
    const formatted = categories.map((c) => ({ id: c._id, name: c.name }));
    return [{ id: 'All', name: 'All' }, ...formatted];
  }, [categories]);

  // Paste this helper function outside your component
  const getPageNumbers = (total, current) => {
    const delta = 1;
    const range = [];
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  return (
    <div className="relative  overflow-x-hidden bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="relative border-b border-slate-200 bg-white">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

        <div className="container relative z-10 mx-auto py-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Unlock Your Potential with{' '}
              <span className="text-supperagent">Expert Courses</span>
            </h1>
            <p className="mb-10 text-lg text-slate-600 md:text-xl">
              Find the perfect course to upgrade your skills and advance your
              career.
            </p>

            {/* Floating Search Bar */}
            <div className="relative mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                  className="w-full border-none bg-transparent py-2 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
              <Button
                onClick={handleSearchClick}
                className="h-12 rounded-xl bg-supperagent px-8 text-base font-semibold transition-transform active:scale-95"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container relative z-10 mx-auto py-8 md:py-12">
        {/* Mobile Filter Toggle Button */}
        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-700 shadow-sm"
          >
            <Filter size={18} /> Filters & Sort
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b pb-4">
                <Sliders size={18} className="text-supperagent" />
                <span className="font-bold text-gray-900">Filters</span>
              </div>

              {/* Passing props to the external component */}
              <FilterSidebar
                categories={allCategories}
                tempCategory={tempCategory}
                setTempCategory={setTempCategory}
                tempMinPrice={tempMinPrice}
                setTempMinPrice={setTempMinPrice}
                tempMaxPrice={tempMaxPrice}
                setTempMaxPrice={setTempMaxPrice}
                handleApplyFilters={handleApplyFilters}
                resetFilters={resetFilters}
              />
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {activeSearchTerm
                  ? `Results for "${activeSearchTerm}"`
                  : 'All Courses'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  Sort by:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] rounded-xl">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Most Relevant</SelectItem>
                    <SelectItem value="low-to-high">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="high-to-low">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onClick={() => navigate(`/courses/${course?.slug}`)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <h3 className="text-lg font-bold">No courses found</h3>
                    <p className="text-gray-500">
                      Try adjusting your price range or category.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {total > 9 && (
              <>
                <div className="mt-12 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  {/* Mobile: Simple Text Info (Hidden on Desktop) */}
                  <p className="text-sm text-muted-foreground sm:hidden">
                    Page{' '}
                    <span className="font-medium text-foreground">
                      {currentPage}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                      {totalPages}
                    </span>
                  </p>

                  {/* The Navigation Pill */}
                  <div className="mx-auto flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    {/* Previous Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>

                    {/* Page Numbers (Desktop + Tablet) */}
                    <div className="hidden items-center gap-1 sm:flex">
                      {getPageNumbers(totalPages, currentPage).map((page, i) =>
                        page === '...' ? (
                          <div
                            key={i}
                            className="flex h-9 w-9 items-center justify-center"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <Button
                            key={i}
                            variant={currentPage === page ? 'default' : 'ghost'}
                            size="icon"
                            className={cn(
                              'h-9 w-9 rounded-full transition-all',
                              currentPage === page
                                ? 'shadow-md hover:bg-supperagent/90'
                                : 'text-muted-foreground hover:text-white'
                            )}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    {/* Mobile: Current Page Indicator (Hidden on Desktop) */}
                    <div className="flex h-9 min-w-[3rem] items-center justify-center rounded-full bg-secondary px-3 text-sm font-medium sm:hidden">
                      {currentPage} / {totalPages}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>

                  {/* Desktop: Results Context (Hidden on Mobile) */}
                  {/* <p className="hidden text-sm text-muted-foreground sm:block">
      Showing <strong>{meta.limit}</strong> results per page
    </p> */}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer (Left Side) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white p-6 shadow-2xl transition-transform animate-in slide-in-from-left">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Reusing the same extracted component */}
            <FilterSidebar
              categories={allCategories}
              tempCategory={tempCategory}
              setTempCategory={setTempCategory}
              tempMinPrice={tempMinPrice}
              setTempMinPrice={setTempMinPrice}
              tempMaxPrice={tempMaxPrice}
              setTempMaxPrice={setTempMaxPrice}
              handleApplyFilters={handleApplyFilters}
              resetFilters={resetFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}
