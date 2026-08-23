import React, { useState, useEffect, useCallback } from 'react';
import {
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
  ChevronRight,
  Quote,
  File,
  Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import CourseContentAccordion from '../components/CourseContentAccordion';
import CourseCard from '../components/CourseCard';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

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
  _id?: string;
  question: string;
  answer: string;
}

interface TestimonialItem {
  _id?: string;
  name: string;
  review: string;
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
  testimonial?: TestimonialItem[];
  courseOverview: string;
  instructorId: Instructor;
  updatedAt?: string;
  language?: string;
  certificateImage?: string;
  courseGuideUrl?: string;
}
// --- Minimal FAQ Accordion Item ---
const MinimalFaqAccordionItem = ({ item }: { item: FaqItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-theme/20 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-base font-semibold text-slate-900 transition-colors hover:text-theme focus:outline-none"
      >
        <span className="pr-4">{item.question}</span>
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
          isOpen
            ? 'grid-rows-[1fr] pt-2 opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-2 text-sm leading-relaxed text-slate-600">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const TestimonialAndFaqSection = ({
  testimonials,
  faqs
}: {
  testimonials?: TestimonialItem[];
  faqs?: FaqItem[];
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasTestimonials = testimonials && testimonials.length > 0;
  const hasFaqs = faqs && faqs.length > 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!hasTestimonials && !hasFaqs) return null;

  return (
    <section className="relative w-full overflow-hidden bg-theme/10 py-12">
      {/* --- Left Side Decorative Concentric Circles --- */}
      <svg
        className="pointer-events-none absolute -left-32 top-10 h-60 w-60 text-theme/20"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="95" />
        <circle cx="100" cy="100" r="76" />
        <circle cx="100" cy="100" r="57" />
        <circle cx="100" cy="100" r="38" />
        <circle cx="100" cy="100" r="19" />
      </svg>

      {/* --- Right Side Decorative Concentric Circles --- */}
      <svg
        className="pointer-events-none absolute -right-32 bottom-10 h-60 w-60 text-theme/20"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="95" />
        <circle cx="100" cy="100" r="76" />
        <circle cx="100" cy="100" r="57" />
        <circle cx="100" cy="100" r="38" />
        <circle cx="100" cy="100" r="19" />
      </svg>

      <div className="container relative z-10 mx-auto">
        <div className="space-y-8">
          {/* --- Testimonials Sub-section --- */}
          {hasTestimonials && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-extrabold text-theme">
                  What our customers say
                </h2>
                <Quote className="h-10 w-10 rotate-180 text-theme" />
              </div>

              {/* Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {testimonials.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="min-w-0 flex-[0_0_100%] px-4 text-center"
                    >
                      <blockquote className="mx-auto mb-6 max-w-4xl text-center text-3xl font-bold leading-relaxed text-slate-800">
                        “{item.review}”
                      </blockquote>

                      <p className="text-center text-base font-bold text-theme md:text-lg">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dot Pagination */}
              {testimonials.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-300',
                        selectedIndex === idx
                          ? 'w-6 bg-theme'
                          : 'w-2.5 bg-theme/40 hover:bg-theme/60'
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- Divider if both sub-sections exist --- */}
          {hasTestimonials && hasFaqs && (
            <div className="border-t border-theme/20" />
          )}

          {/* --- FAQ Sub-section --- */}
          {hasFaqs && (
            <div>
              <h2 className="text-3xl font-extrabold text-theme">FAQs</h2>
              <p className="mb-4 mt-2 text-sm text-black md:text-base">
                Discover answers to common questions in our FAQ section,
                offering clarity and convenience at your fingertips
              </p>
              <div className="mx-auto text-start">
                <div className="divide-y text-left">
                  {faqs.map((item, index) => (
                    <MinimalFaqAccordionItem
                      key={item._id || index}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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

  // UI States
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'requirements'>(
    'content'
  );
  const [downloadingGuide, setDownloadingGuide] = useState(false);

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
  const handleGoHome = () => navigate('/');

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

  const handleDownloadGuide = async () => {
    if (!course?.courseGuideUrl) return;

    setDownloadingGuide(true);
    try {
      const response = await fetch(course.courseGuideUrl);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const urlParts = course.courseGuideUrl.split('/');
      const originalFileName = urlParts[urlParts.length - 1] || 'course-guide';

      // Remove timestamp prefix such as "1787408466652-"
      const fileName = originalFileName.replace(/^\d+-/, '');
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading course guide:', error);
      // alert('Unable to download the course guide. Please try again.');
    } finally {
      setDownloadingGuide(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-slate-900 pb-8 pt-10 lg:pb-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-600/20 blur-[100px]"></div>

        <div className="container relative z-10 mx-auto">
          {/* --- Breadcrumb --- */}
          <nav className="mb-8 flex items-center gap-2 text-sm font-medium">
            <button
              onClick={handleGoHome}
              className="text-theme transition-colors hover:text-theme/80"
            >
              Home
            </button>
            <ChevronRight size={14} className="text-slate-100" />
            <button
              onClick={handleBackToCourses}
              className="text-theme transition-colors hover:text-theme/80"
            >
              Course
            </button>
            <ChevronRight size={14} className="text-slate-100" />
            <span className="max-w-[160px] truncate text-slate-100 sm:max-w-xs">
              {course.title}
            </span>
          </nav>

          {/* --- Hero text --- */}
          <div className="max-w-4xl space-y-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl">
              {course.title}
            </h1>

            {course.courseOverview && (
              <p className="text-md w-full leading-relaxed text-slate-200">
                {course.courseOverview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white">
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">Pass Requirement</span>
                <span className="text-lg font-bold text-white">70%</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-300">Course Validity</span>
                <span className="text-lg font-bold text-white">1 Year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="container relative z-20 mx-auto pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-5 pt-5 lg:col-span-2">
            {/* Expandable Course Description */}
            {course.description &&
              (() => {
                const textOnly = course.description
                  .replace(/<[^>]*>/g, '')
                  .trim();
                const wordCount = textOnly
                  ? textOnly.split(/\s+/).filter(Boolean).length
                  : 0;
                const isLongDescription = wordCount > 200;

                return (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      Description
                    </h2>
                    <div className="relative overflow-hidden">
                      <div
                        className={cn(
                          'prose prose-sm prose-slate max-w-none transition-all duration-300 md:prose-base prose-headings:font-bold prose-p:text-black prose-a:text-blue-600 prose-img:rounded-xl',
                          isLongDescription &&
                            !isDescriptionExpanded &&
                            'max-h-36 overflow-hidden'
                        )}
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                      {isLongDescription && !isDescriptionExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-16" />
                      )}
                    </div>

                    {isLongDescription && (
                      <button
                        onClick={() =>
                          setIsDescriptionExpanded(!isDescriptionExpanded)
                        }
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

            {/* What You'll Learn */}
            {course.learningPoints && course.learningPoints.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Zap className="fill-amber-500 text-amber-500" size={20} />
                  What You'll Learn
                </h3>
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
            )}

            {/* Tabbed Container (Course Content & Requirements) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/60 p-2">
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
                        There are no specialized prerequisites for taking this
                        course.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Course Certificate</h2>
                <p className="mt-1 text-sm">
                  Earn a verified certificate upon completion to demonstrate
                  your skills and accomplishments.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                  <div className="space-y-3 lg:col-span-7">
                    <h3 className="text-xl font-extrabold">
                      {course.title}{' '}
                      <span className="text-theme">Certificate</span>
                    </h3>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-theme">
                        What does my certificate include?
                      </h4>
                      <p className="text-sm leading-relaxed">
                        Includes your full name, course name, date of
                        completion, and a unique verification ID.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center lg:col-span-5">
                    <div className="relative w-full max-w-sm overflow-hidden border border-slate-200 bg-white p-1 shadow-md transition-shadow hover:shadow-lg">
                      <img
                        src="/certificate.png"
                        alt="Certificate image"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Section */}
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

          {/* RIGHT SIDEBAR (Moved negative margin to outer container so sticky floats properly) */}
          <div className="relative z-30 lg:col-span-1 lg:-translate-y-64">
            <div className="sticky top-24 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="p-6">
                  <div>
                    <img
                      src={course.image}
                      alt={course.title}
                      className="mb-2 h-full w-full transform rounded-xl object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                  </div>
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
                      className="w-full rounded-xl border-2 border-theme bg-white px-4 py-3.5 font-bold text-theme transition-all hover:border-slate-300"
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
                  {course.courseGuideUrl && (
                    <div className="mt-4">
                      <button
                        onClick={handleDownloadGuide}
                        disabled={downloadingGuide}
                        className="flex w-full transform items-center justify-center gap-2 rounded-xl border-2 border-theme px-4 py-3.5 font-bold text-theme transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadingGuide ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />{' '}
                            Downloading...
                          </>
                        ) : (
                          <>
                            <File className="h-5 w-5" /> Download Course Guide
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
      </div>

      {/* --- TESTIMONIAL & FAQ SECTION --- */}
      <div>
        <TestimonialAndFaqSection
          testimonials={course.testimonial}
          faqs={course.faq}
        />
      </div>

      {/* --- RECOMMENDED COURSES SECTION --- */}
      <div className="container mx-auto">
        {moreCourses.length > 0 && (
          <div className="py-12">
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
