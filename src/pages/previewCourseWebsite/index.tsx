// PreviewCourseDetails.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Download,
  Award,
  Share2,
  Heart,
  Zap
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // 👈 removed useNavigate
import axiosInstance from '@/lib/axios';
// 👇 Removed useDispatch and cart-related logic
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import CourseContentAccordion from './components/CourseContentAccordion';



export default function PreviewCourseDetails() {
  const { cid } = useParams<{ cid: string }>();
  // 🚫 No navigation or dispatch
  const { toast } = useToast();
  const [moreCourses, setMoreCourses] = useState([]);
  const [moreLoading, setMoreLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState<
    {
      title: string;
      lessons: number;
      hours: string;
      lessonsList: { id: string; title: string; duration: string }[];
    }[]
  >([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate()
  // 🔄 Fetch data (same logic, but no cart/navigation side effects)
  useEffect(() => {
    const fetchData = async () => {
      if (!cid) return;
      try {
        setLoading(true);
        setError(null);
        const courseRes = await axiosInstance.get(`/courses/${cid}`);
        const courseData: any = courseRes.data.data;
        setCourse(courseData);

        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: cid }
        });
        const modules: any[] = modulesRes.data.data.result;

        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get('/course-lesson', {
              params: { moduleId: mod._id }
            });
            const lessons: any[] = lessonsRes.data.data.result;
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
              return sum + (isNaN(Number(lesson.duration)) ? 0 : Number(lesson.duration));
            }, 0);
            return {
              title: module.title,
              lessons: lessons.length,
              hours: totalMinutes / 60 >= 1 ? (totalMinutes / 60).toFixed(1) : '<1',
              lessonsList: lessons.map((lesson) => ({
                id: lesson._id,
                title: lesson.title,
                duration: lesson.duration || '—'
              }))
            };
          }
        );
        setSections(transformedSections);
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course details.');
        toast({
          title: 'Error',
          description: 'Unable to load course. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cid]);

  useEffect(() => {
    const fetchMoreCourses = async () => {
      if (!course?.instructorId?._id) return;
      try {
        setMoreLoading(true);
        const res = await axiosInstance.get('/courses', {
          params: { instructorId: course.instructorId._id, limit: 5 }
        });
        setMoreCourses(
          res.data.data.result.filter((c: any) => c._id !== course._id)
        );
      } catch (err) {
        console.error('Failed to fetch more courses:', err);
      } finally {
        setMoreLoading(false);
      }
    };
    fetchMoreCourses();
  }, [course?.instructorId?._id]);

  // 🚫 No-op functions — everything disabled
  const handleBackToCourses = () => {
    navigate(-1)
  };

  const handleAddToCart = () => {
    // Do nothing
    toast({
      title: 'Preview Mode',
      description: 'Adding to cart is not available in preview.',
      variant: 'default'
    });
  };

  const handleSuggestedCourseClick = () => {
    // Disabled
    toast({
      title: 'Preview Mode',
      description: 'Course navigation is disabled.',
    });
  };

  // 🎨 Render logic (same UI, but non-interactive)

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );

  if (error || !course)
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        {error || 'Course not found'}
      </div>
    );

  return (
    <div className="">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 text-white">
        <div className="container mx-auto px-4">
          <button
            onClick={handleBackToCourses}
            
            className="mb-6 flex items-center gap-2 font-medium text-white "
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold lg:text-5xl">{course.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT SECTION — same, but ensure no hidden links */}
          <div className="space-y-12 lg:col-span-2">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img
                src={course.image || '/javascript-programming-web-development.png'}
                alt={course.title}
                className="h-80 w-full object-cover"
              />
            </div>

            {/* Rating & Instructor — static */}
            <div className="border-b border-gray-200 pb-8">
              <div className="mb-6 flex items-center gap-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(4)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
                <span className="font-bold text-gray-900">4.2 Rating</span>
                <span className="text-gray-600">(112 reviews)</span>
                <span className="text-gray-600">1002 students</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
                  {course.instructorId?.name?.split(' ')?.map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {course.instructorId?.name}
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>⭐ 4.2 Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Points, Requirements, About — all static */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">What you'll learn</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {course.learningPoints.map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <Zap size={14} className="text-supperagent" />
                    </div>
                    <span className="font-medium text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Requirements</h2>
              <ul className="space-y-3">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="font-bold text-supperagent">•</span>
                    <span className="font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">About This Course</h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>

            {/* Accordion — still interactive for expand/collapse (OK for preview) */}
            <CourseContentAccordion sections={sections} />

            {/* Instructor Details — static */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
                  {course.instructorId?.name?.split(' ')?.map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{course.instructorId?.name}</h3>
                  <p className="mb-2 text-gray-700">{course.instructorId?.title}</p>
                  <p className="leading-relaxed text-gray-700">{course.instructorId?.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR — disable all buttons */}
          <div className="sticky top-8 lg:col-span-1">
            <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="border-b pb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                  <span className="text-gray-500 line-through">${course.originalPrice}</span>
                </div>
                <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-supperagent">
                  Save ${(course.originalPrice - course.price).toFixed(2)}
                </span>
              </div>

              {/* ❌ Disabled buttons */}
              <button
                onClick={()=>{}}
                className="w-full rounded-md bg-supperagent py-3 font-medium text-white "
              >
                Add to Cart
              </button>
              <button
                className="w-full rounded-md border py-3 font-medium text-gray-500 "
              >
                Buy Now
              </button>

              <div className="space-y-4 border-t pt-5 text-sm">
                <div className="flex items-center gap-3">
                  <Clock size={14} />
                  <span>{course.duration} hours on demand</span>
                </div>
                <div className="flex items-center gap-3">
                  <Download size={14} />
                  <span>{course.resources} downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award size={14} />
                  <span>Certificate of completion</span>
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  disabled
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-gray-500 cursor-not-allowed opacity-60"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  disabled
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-gray-500 cursor-not-allowed opacity-60"
                >
                  <Heart
                    size={16}
                    fill="none"
                    className=""
                  />
                  Wishlist
                </button>
              </div>
            </div>

            {/* Suggested Courses — disable navigation */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">More by {course.instructorId?.name}</h3>
              {moreLoading ? (
                <p className="text-sm italic text-gray-500">Loading more courses...</p>
              ) : moreCourses.length === 0 ? (
                <p className="text-sm italic text-gray-500">No other courses available.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {moreCourses.map((c) => (
                    <div
                      key={c._id}
                      // 🚫 No onClick, no pointer cursor
                      className="rounded-md border p-3 bg-gray-50 text-gray-500"
                    >
                      <h4 className="font-medium">{c.title}</h4>
                      <p className="text-sm">${c.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}