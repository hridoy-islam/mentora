import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Download,
  Award,
  BarChart3,
  Share2,
  Heart,
  Zap,
  CheckCircle2,
  PlayCircle,
  FileText,
  AlertCircle,
  Globe,
  MonitorPlay,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import CourseContentAccordion from '../components/CourseContentAccordion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button'; // Assuming you have shadcn or similar, else standard buttons used below
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// --- Types (Kept the same) ---
interface Lesson {
  _id: string;
  title: string;
  duration?: string;
  type: 'video' | 'doc' | 'quiz';
}

interface CourseModule {
  _id: string;
  title: string;
}

interface Instructor {
  _id: string;
  name: string;
  title?: string;
  bio?: string;
  rating?: number;
  students?: number;
  image?: string; // Added image field if available
}

interface Course {
  _id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  students: number;
  duration: number;
  resources: number;
  learningPoints: string[];
  requirements: string[];
  aboutDescription: string;
  instructorId: Instructor;
  updatedAt?: string; // Added for "Last updated"
  language?: string; // Added for language display
}

// --- Skeleton Component for Loading ---
const CourseSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-gray-50">
    <div className="h-96 bg-slate-900/10"></div>
    <div className="container mx-auto -mt-32 px-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-80 rounded-xl bg-gray-200"></div>
          <div className="h-10 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-96 rounded-xl bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [moreCourses, setMoreCourses] = useState<Course[]>([]);
  const [moreLoading, setMoreLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // 1. Copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);

      // 2. Set copied state to true
      setCopied(true);

      // 3. Reset state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };



  const handleBuyNow = () => {
    if (!course) return;
    
    // 1. Add to Cart (Same payload as handleAddToCart)
    dispatch(
      addToCart({
        id: course._id,
        title: course.title,
        price: course.price,
        image: course.image,
        quantity: 1
      })
    );

    navigate('/cart');
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        const courseRes = await axiosInstance.get(`/courses/?slug=${slug}`);
        const courseData: Course = courseRes.data.data.result[0];
        setCourse(courseData);

        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: course?._id }
        });
        const modules: CourseModule[] = modulesRes.data.data.result;

        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get(
              '/course-lesson?fields=title,type,duration',
              {
                params: { moduleId: mod._id }
              }
            );
            const lessons: Lesson[] = lessonsRes.data.data.result;
            return { module: mod, lessons };
          })
        );

        const transformedSections = modulesWithLessons.map(
          ({ module, lessons }) => {
            const totalMinutes = lessons.reduce((sum, lesson) => {
              if (!lesson.duration) return sum;
              const parts = lesson.duration.split(':').map(Number);
              if (parts.length === 2) return sum + parts[0];
              if (parts.length === 3) return sum + parts[0] * 60 + parts[1];
              return (
                sum +
                (isNaN(Number(lesson.duration)) ? 0 : Number(lesson.duration))
              );
            }, 0);

            return {
              title: module.title,
              lessons: lessons.length,
              hours:
                totalMinutes / 60 >= 1 ? (totalMinutes / 60).toFixed(1) : '<1',
              lessonsList: lessons.map((lesson) => ({
                id: lesson._id,
                title: lesson.title,
                duration: lesson.duration || '—',
                type: lesson.type || 'video'
              }))
            };
          }
        );

        setSections(transformedSections);
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    const fetchMoreCourses = async () => {
      if (!course?.instructorId?._id) return;
      try {
        setMoreLoading(true);
        const res = await axiosInstance.get('/courses', {
          params: { instructorId: course.instructorId._id, limit: 5 }
        });
        setMoreCourses(
          res.data.data.result.filter((c: Course) => c._id !== course._id)
        );
      } catch (err) {
        console.error('Failed to fetch more courses:', err);
      } finally {
        setMoreLoading(false);
      }
    };
    fetchMoreCourses();
  }, [course?.instructorId?._id]);

  const handleBackToCourses = () => navigate('/courses');

  const handleAddToCart = () => {
    if (!course) return;
    dispatch(
      addToCart({
        id: course._id,
        title: course.title,
        price: course.price,
        image: course.image,
        quantity: 1
      })
    );
    toast({
      title: 'Added to Cart',
      description: `"${course.title}" is now in your cart.`
    });
  };

  if (loading) return <CourseSkeleton />;

  if (error || !course)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-slate-600">
        <AlertCircle size={48} className="mb-4 text-red-500 opacity-50" />
        <h2 className="text-2xl font-semibold text-slate-800">
          Oops! Course Not Found
        </h2>
        <p className="mt-2 text-slate-500">
          {error || 'The course you are looking for does not exist.'}
        </p>
        <button
          onClick={handleBackToCourses}
          className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-white transition-colors hover:bg-slate-800"
        >
          Return to Courses
        </button>
      </div>
    );

  // Calculate discount percentage
  const discountPercent = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50  selection:bg-blue-100">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-slate-900 pb-32 pt-10 lg:pb-40">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-600/20 blur-[100px]"></div>

        <div className="container relative z-10 mx-auto px-6">
          {/* Breadcrumb / Back */}
          <button
            onClick={handleBackToCourses}
            className="group mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <div className="rounded-full bg-slate-800 p-1.5 transition-colors group-hover:bg-slate-700">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Courses</span>
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white ">
                {course.title}
              </h1>

              <p className="line-clamp-2 max-w-2xl text-lg leading-relaxed text-slate-300">
                {/* Strip HTML tags for the short description in hero if necessary */}
                {course.description.replace(/<[^>]*>?/gm, '').substring(0, 150)}
                ...
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <span className="text-base font-bold">{course.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(course.rating)
                            ? 'fill-current'
                            : 'text-slate-600'
                        }
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-slate-400 underline decoration-slate-600 underline-offset-4">
                    ({course.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MonitorPlay size={16} className="text-slate-400" />
                  <span>{course.students.toLocaleString()} Students</span>
                </div>

                {/* <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-slate-400" />
                  <span>English</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="container relative z-20 mx-auto -mt-24 px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* LEFT COLUMN (Content) */}
          <div className="space-y-10 lg:col-span-2">
            {/* Course Cover Image (Static) */}
            <div className="group relative aspect-video select-none overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-900/10">
              {/* The Image */}
              <img
                src={course?.image || '/placeholder.jpg'}
                alt={course.title}
                className="h-full w-full transform object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />

              {/* Gradient Overlay for Depth (Makes it look premium) */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"></div>

              {/* Optional: Watermark / Brand Logo (Center or Bottom Right) */}
              {/* This adds a professional 'brand' feel without looking like a play button */}
              <div className="absolute bottom-4 right-4 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 text-sm font-medium text-white/80 ring-1 ring-white/10 backdrop-blur-sm">
                  <Sparkles size={14} />
                  <span>Medicare Verified</span>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* What you'll learn - Designed as a highlighted section */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-8">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Zap className="fill-amber-500 text-amber-500" size={20} />
                  What you'll learn
                </h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                  {course.learningPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-emerald-600"
                      />
                      <span className="text-sm font-medium leading-relaxed text-slate-700">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div>
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Course Content
                  </h2>
                  <div className="flex items-center gap-4 text-sm font-medium"></div>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <CourseContentAccordion sections={sections} />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Requirements
                </h2>
                <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                  <ul className="space-y-3">
                    {course.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm leading-relaxed text-slate-700"
                      >
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Description
                </h2>
                <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                  <div
                    className="prose prose-sm prose-slate max-w-none md:prose-base prose-headings:font-bold prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Instructor
                </h2>
                <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold text-slate-500 ring-2 ring-slate-100">
                        {course.instructorId?.image ? (
                          <img
                            src={course.instructorId.image}
                            alt={course.instructorId.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          course.instructorId?.name?.charAt(0)
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {course.instructorId?.name}
                      </h3>
                      <p className="mb-4 text-sm font-medium text-blue-600">
                        {course.instructorId?.title}
                      </p>

                      {/* Stats Row */}
                      {/* <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-slate-600 mb-4 border-b border-slate-100 pb-4">
                       <div className="flex items-center gap-1.5">
                         <Star size={14} className="fill-amber-400 text-amber-400" />
                         <span className="font-semibold text-slate-900">{course.instructorId?.rating}</span>
                         <span className="text-slate-500">Rating</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <Award size={14} className="text-slate-400" />
                         <span className="font-semibold text-slate-900">{course.instructorId?.reviews?.toLocaleString()}</span>
                         <span className="text-slate-500">Reviews</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <BarChart3 size={14} className="text-slate-400" />
                         <span className="font-semibold text-slate-900">{course.instructorId?.students?.toLocaleString()}</span>
                         <span className="text-slate-500">Students</span>
                       </div>
                    </div> */}

                      <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 transition-all duration-300 hover:line-clamp-none">
                        {course.instructorId?.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* More Courses */}
            {moreCourses.length > 0 && (
              <div className="border-t border-slate-200 pt-8">
                <h3 className="mb-6 text-xl font-bold text-slate-900">
                  More courses by {course.instructorId?.name}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {moreCourses.map((c) => (
                    <div
                      key={c._id}
                      className="group flex cursor-pointer gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
                      onClick={() => navigate(`/courses/${c._id}`)}
                    >
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <img
                          src={c.image || '/placeholder-course.jpg'}
                          alt={c.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <h4 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">
                            ${c.price}
                          </span>
                          <span className="text-slate-400 line-through">
                            ${c.originalPrice}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star size={10} fill="currentColor" />
                            {c.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="p-6">
                  <div className="mb-6">
                    <div className="mb-2 flex items-end gap-3">
                      <span className="text-4xl font-extrabold text-slate-900">
                        ${course.price}
                      </span>
                      <span className="mb-1.5 text-lg text-slate-400 line-through">
                        ${course.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                        {discountPercent}% Off
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-supperagent px-4 py-3.5 font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-supperagent/90 active:scale-95"
                    >
                      Add to Cart
                    </button>
                    <button onClick={handleBuyNow} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-900 transition-all hover:border-slate-300">
                      Buy Now
                    </button>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-900">
                      This course includes:
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-center gap-3">
                        <MonitorPlay size={16} className="text-slate-400" />
                        <span>Access on mobile and TV</span>
                      </li>

                      <li className="flex items-center gap-3">
                        <Award size={16} className="text-slate-400" />
                        <span>Certificate of completion</span>
                      </li>

                      {/* Course validity */}
                      <li className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Course validity: 1 year</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer Actions */}
              <div className="border-t border-slate-100 bg-slate-50 p-4">
  <button
    onClick={handleShare}
    disabled={copied}
    className={cn(
      "group flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200",
      copied
        ? "bg-emerald-50 text-emerald-600 cursor-default" // Success state
        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95" // Default state
    )}
  >
    {copied ? (
      <>
        <Check
          size={16}
          className="animate-in zoom-in spin-in-90 duration-300"
        />
        <span>Link Copied</span>
      </>
    ) : (
      <>
        <Share2
          size={16}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
        />
        <span>Share this course</span>
      </>
    )}
  </button>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
