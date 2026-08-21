import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Award,
  Share2,
  Zap,
  CheckCircle2,
  AlertCircle,
  MonitorPlay,
  Sparkles,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import CourseContentAccordion from '../components/CourseContentAccordion';
import CourseCard from '../components/CourseCard';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// --- Types ---
interface Lesson {
  _id: string;
  title: string;
  duration?: string;
  type: 'video' | 'doc' | 'quiz';
  index?: number;
}

interface CourseModule {
  _id: string;
  title: string;
  index?: number;
}

interface Instructor {
  _id: string;
  name: string;
  title?: string;
  bio?: string;
  rating?: number;
  students?: number;
  image?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface Course {
  _id: string;
  title: string;
  slug?: string;
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
  faq?: FaqItem[];
  courseOverview: string;
  instructorId: Instructor;
  updatedAt?: string;
  language?: string;
}

const FaqAccordionItem = ({ item }: { item: FaqItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 transition-colors hover:bg-slate-50/80 focus:outline-none"
      >
        <div className="flex items-center gap-2 pr-4">
          <HelpCircle size={18} className="shrink-0 text-theme" />
          <span>{item.question}</span>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-slate-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600 sm:pl-11">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Component ---
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New UI States
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'content' | 'requirements'>('learn');

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBuyNow = () => {
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
    navigate('/cart');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        const courseRes = await axiosInstance.get(`/courses/slug/${slug}`);
        const courseData: Course = courseRes.data.data;
        setCourse(courseData);

        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: courseData?._id }
        });
        const modules: CourseModule[] = modulesRes.data.data.result;
        const sortedModules = [...modules].sort(
          (a, b) => (a.index ?? 0) - (b.index ?? 0)
        );

        const modulesWithLessons = await Promise.all(
          sortedModules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get(
              '/course-lesson?fields=title,type,duration,index',
              {
                params: { moduleId: mod._id }
              }
            );
            const lessons: Lesson[] = lessonsRes.data.data.result;
            const sortedLessons = [...lessons].sort(
              (a, b) => (a.index ?? 0) - (b.index ?? 0)
            );
            return { module: mod, lessons: sortedLessons };
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
      if (!course?._id) return;
      try {
        setMoreLoading(true);
        const res = await axiosInstance.get('/courses?limit=4');
        setMoreCourses(
          res.data.data.result.filter((c: Course) => c._id !== course._id)
        );
      } catch (err) {
        console.error('Failed to fetch recommended courses:', err);
      } finally {
        setMoreLoading(false);
      }
    };
    fetchMoreCourses();
  }, [course?._id]);

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

  const hasDiscount =
    course.originalPrice && course.originalPrice > course.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((course.originalPrice - course.price) / course.originalPrice) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-slate-900 pb-32 pt-10 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-600/20 blur-[100px]"></div>

        <div className="container relative z-10 mx-auto px-6">
          <button
            onClick={handleBackToCourses}
            className="group mb-8 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <div className="rounded-full bg-slate-800 p-1.5 transition-colors group-hover:bg-slate-700">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Courses</span>
          </button>

          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl">
              {course.title}
            </h1>

            {/* FULL-WIDTH COURSE OVERVIEW */}
            {course.courseOverview && (
              <p className="w-full text-lg leading-relaxed text-slate-200">
                {course.courseOverview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white">
              {course.rating > 0 && (
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
                  {course.reviews > 0 && (
                    <span className="ml-1 text-slate-400 underline decoration-slate-600 underline-offset-4">
                      ({course.reviews} reviews)
                    </span>
                  )}
                </div>
              )}

              {course.students > 0 && (
                <div className="flex items-center gap-1.5">
                  <MonitorPlay size={16} className="text-slate-400" />
                  <span>{course.students.toLocaleString()} Students</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="container relative z-20 mx-auto -mt-24 px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-10 lg:col-span-2">
            {/* 1. Course Cover Image */}
            {course.image && (
              <div className="group relative aspect-video select-none overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-900/10">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full transform object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"></div>
                <div className="absolute bottom-4 right-4 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 text-sm font-medium text-white/80 ring-1 ring-white/10 backdrop-blur-sm">
                    <Sparkles size={14} />
                    <span>Verified Course</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Expandable Course Description */}
            {course.description && (() => {
              const textOnly = course.description.replace(/<[^>]*>/g, '').trim();
              const wordCount = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;
              const isLongDescription = wordCount > 300;

              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-bold text-slate-900">
                    Course Description
                  </h2>
                  <div className="relative overflow-hidden">
                    <div
                      className={cn(
                        'prose prose-sm prose-slate max-w-none md:prose-base transition-all duration-300 prose-headings:font-bold prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl',
                        isLongDescription && !isDescriptionExpanded && 'max-h-36 overflow-hidden'
                      )}
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                    {isLongDescription && !isDescriptionExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>

                  {isLongDescription && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-4 flex items-center gap-1.5 text-sm font-bold text-theme hover:text-theme/90 focus:outline-none"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Show Less <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* 3. Tabbed Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/60 p-2">
                <button
                  onClick={() => setActiveTab('learn')}
                  className={cn(
                    'flex-1 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                    activeTab === 'learn'
                      ? 'bg-theme text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                  )}
                >
                  What You'll Learn
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    'flex-1 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                    activeTab === 'content'
                      ? 'bg-theme text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                  )}
                >
                  Course Content
                </button>
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={cn(
                    'flex-1 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                    activeTab === 'requirements'
                      ? 'bg-theme text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                  )}
                >
                  Requirements
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'learn' && (
                  <div>
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Zap className="fill-amber-500 text-amber-500" size={20} />
                      Key Learning Outcomes
                    </h3>
                    {course.learningPoints && course.learningPoints.length > 0 ? (
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
                    ) : (
                      <p className="text-sm text-slate-500">
                        No specific learning outcomes listed for this course.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'content' && (
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-slate-900">
                      Course Curriculum
                    </h3>
                    {sections && sections.length > 0 ? (
                      <CourseContentAccordion sections={sections} />
                    ) : (
                      <p className="text-sm text-slate-500">
                        No modules available yet.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-slate-900">
                      Prerequisites
                    </h3>
                    {course.requirements && course.requirements.length > 0 ? (
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
                    ) : (
                      <p className="text-sm text-slate-500">
                        There are no specialized prerequisites for taking this course.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* 4. FAQ Section */}
{course.faq && course.faq.length > 0 && (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-slate-900">
      Frequently Asked Questions
    </h2>
    <div className="space-y-3">
      {course.faq.map((item, index) => (
        <FaqAccordionItem key={index} item={item} />
      ))}
    </div>
  </div>
)}

            {/* 5. Instructor Section */}
            {course.instructorId && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  Instructor
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="shrink-0">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold text-slate-500 ring-2 ring-slate-100">
                        {course.instructorId.image ? (
                          <img
                            src={course.instructorId.image}
                            alt={course.instructorId.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          course.instructorId.name?.charAt(0)
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {course.instructorId.name}
                      </h3>
                      {course.instructorId.title && (
                        <p className="mb-4 text-sm font-medium text-blue-600">
                          {course.instructorId.title}
                        </p>
                      )}
                      {course.instructorId.bio && (
                        <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 transition-all duration-300 hover:line-clamp-none">
                          {course.instructorId.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Sticky Pricing Card) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="p-6">
                  <div className="mb-6">
                    <div className="mb-2 flex items-end gap-3">
                      <span className="text-4xl font-extrabold text-slate-900">
                        ${course.price}
                      </span>
                      {hasDiscount && (
                        <span className="mb-1.5 text-lg text-slate-400 line-through">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                          {discountPercent}% Off
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-supperagent px-4 py-3.5 font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-supperagent/90 active:scale-95"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-900 transition-all hover:border-slate-300"
                    >
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
                      <li className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Course validity: 1 year</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <button
                    onClick={handleShare}
                    disabled={copied}
                    className={cn(
                      'group flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200',
                      copied
                        ? 'cursor-default bg-emerald-50 text-emerald-600'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95'
                    )}
                  >
                    {copied ? (
                      <>
                        <Check
                          size={16}
                          className="duration-300 animate-in zoom-in spin-in-90"
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

        {/* --- RECOMMENDED COURSES SECTION --- */}
        {moreCourses.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Recommended Courses
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Explore top-rated courses picked for you
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {moreCourses.map((c, index) => (
                <CourseCard
                  key={c._id}
                  course={c}
                  index={index}
                  onClick={() => navigate(`/courses/slug/${c.slug || c._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}