import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  FileText,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  Search,
  FileQuestion // Added icon for no data
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/lib/axios';

// --- Types ---
interface QuestionOption {
  _id?: string;
  question: string;
  type: string;
  options: string[];
  correctAnswers: string[];
}

interface LessonData {
  _id: string;
  moduleId: string;
  title: string;
  type: 'video' | 'doc' | 'quiz';
  duration: string;
  index: number;
  lock: boolean;
  videoUrl?: string;
  content?: string;
  questions?: QuestionOption[];
}

interface CourseModule {
  _id: string;
  title: string;
}

interface Section {
  _id: string;
  title: string;
  lessonsList: LessonData[];
  totalDurationMinutes: number;
}

interface CourseMetadata {
  _id: string;
  title: string;
  description?: string;
}

export function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [course, setCourse] = useState<CourseMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Course Info
        const courseRes = await axiosInstance.get(`/courses?slug=${slug}`);
        
        const courseData = courseRes.data.data.result[0];
        
        // If no course found, stop here (loading will be set to false in finally)
        if (!courseData) {
            setCourse(null);
            return; 
        }

        setCourse(courseData);

        // 2. Fetch Modules
        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: courseData._id }
        });
        const modules: CourseModule[] = modulesRes.data.data.result;

        // 3. Fetch Lessons
        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get('/course-lesson', {
              params: { moduleId: mod._id }
            });

            const rawLessons: LessonData[] = lessonsRes.data.data.result;
            const sortedLessons = rawLessons.sort((a, b) => a.index - b.index);
            const totalDuration = sortedLessons.reduce(
              (acc, lesson) => acc + (parseInt(lesson.duration) || 0),
              0
            );

            return {
              _id: mod._id,
              title: mod.title,
              lessonsList: sortedLessons,
              totalDurationMinutes: totalDuration
            };
          })
        );

        setSections(modulesWithLessons);

        // Auto-select logic
        if (modulesWithLessons.length > 0) {
          const firstModule = modulesWithLessons[0];
          setExpandedModules(new Set([firstModule._id]));

          const firstUnlocked = firstModule.lessonsList.find((l) => !l.lock);
          if (firstUnlocked) {
            setCurrentLesson(firstUnlocked);
          } else if (firstModule.lessonsList.length > 0) {
            setCurrentLesson(firstModule.lessonsList[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // --- Navigation & Helper Logic ---

  // 1. Flatten lessons for Next/Prev buttons
  const allLessons = useMemo(() => {
    return sections.flatMap((section) => section.lessonsList);
  }, [sections]);

  const currentIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return allLessons.findIndex((l) => l._id === currentLesson._id);
  }, [currentLesson, allLessons]);

  // --- NEW: Module-Wise Progress Logic ---
  const currentModule = useMemo(() => {
    if (!currentLesson) return null;
    return sections.find((section) => section._id === currentLesson.moduleId);
  }, [sections, currentLesson]);

  const moduleStats = useMemo(() => {
    if (!currentModule) return { total: 0, unlocked: 0, percentage: 0 };

    const total = currentModule.lessonsList.length;
    const unlocked = currentModule.lessonsList.filter((l) => !l.lock).length;

    const percentage = total === 0 ? 0 : Math.round((unlocked / total) * 100);

    return { total, unlocked, percentage };
  }, [currentModule]);

  // --- Search Filtering ---
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = sections
      .map((section) => {
        const matchingLessons = section.lessonsList.filter((lesson) =>
          lesson.title.toLowerCase().includes(lowerQuery)
        );
        return {
          ...section,
          lessonsList: matchingLessons
        };
      })
      .filter((section) => section.lessonsList.length > 0);
    return filtered;
  }, [sections, searchQuery]);

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const ids = filteredSections.map((s) => s._id);
      setExpandedModules((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchQuery, filteredSections]);

  const handleNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.lock) {
        handleLessonClick(nextLesson);
      }
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      if (!prevLesson.lock) {
        handleLessonClick(prevLesson);
      }
    }
  };

  const formatDuration = (totalMinutes: number) => {
    if (!totalMinutes) return '0 min';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`;
    }
    return `${minutes} min`;
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) newExpanded.delete(moduleId);
    else newExpanded.add(moduleId);
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lesson: LessonData) => {
    if (!lesson.lock) {
      if (!expandedModules.has(lesson.moduleId)) {
        setExpandedModules((prev) => new Set(prev).add(lesson.moduleId));
      }
      setCurrentLesson(lesson);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  // --- Renderers ---
  const renderContent = () => {
    if (!currentLesson)
      return (
        <div className="p-10 text-center text-slate-500">
          Select a lesson to begin
        </div>
      );

    if (currentLesson.type === 'video') {
      return (
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl border-none bg-black shadow-xl ring-1 ring-slate-900/5">
            <div className="relative aspect-video w-full">
              {currentLesson.videoUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-400">
                  <Play className="mb-2 h-12 w-12 opacity-50" />
                  <p>Video Source Unavailable</p>
                </div>
              )}
            </div>
          </Card>

          <div className="px-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {currentLesson.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              Video Lesson • {currentLesson.duration} minutes
            </p>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'doc') {
      return (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
                {currentLesson.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="h-4 w-4" />
                <span>
                  Reading Material • {currentLesson.duration} min read
                </span>
              </div>
            </div>

            <div
              className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{
                __html: currentLesson.content || '<p>No content available.</p>'
              }}
            />
          </CardContent>
        </Card>
      );
    }

    if (currentLesson.type === 'quiz') {
      return (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-supperagent shadow-inner">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {currentLesson.title}
                  </h1>
                  <p className="text-sm font-medium text-slate-500">
                    Test your knowledge
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit px-3 py-1 text-sm">
                {currentLesson.questions?.length || 0} Questions
              </Badge>
            </div>

            <div className="space-y-10">
              {currentLesson.questions?.map((q, qIndex) => (
                <div key={qIndex} className="space-y-4">
                  <h3 className="text-lg font-semibold leading-snug text-slate-900">
                    <span className="mr-2 text-slate-400">{qIndex + 1}.</span>
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3 pl-0 sm:pl-6">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedAnswers[qIndex] === opt;
                      const isCorrect = q.correctAnswers.includes(opt);

                      let containerStyle =
                        'border-slate-200 hover:border-supperagent hover:bg-supperagent/10';
                      let textStyle = 'text-slate-600';
                      let indicatorStyle = 'border-slate-300';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          containerStyle =
                            'bg-emerald-50 border-emerald-500 shadow-sm';
                          textStyle = 'text-emerald-800 font-medium';
                          indicatorStyle =
                            'border-emerald-500 bg-emerald-500 text-white';
                        } else if (isSelected && !isCorrect) {
                          containerStyle =
                            'bg-rose-50 border-rose-500 shadow-sm';
                          textStyle = 'text-rose-800 font-medium';
                          indicatorStyle =
                            'border-rose-500 bg-rose-500 text-white';
                        }
                      } else if (isSelected) {
                        containerStyle =
                          'border-supperagent bg-supperagent/5 shadow-md ring-1 ring-supperagent/10';
                        textStyle = 'text-supperagent font-semibold';
                        indicatorStyle = 'border-supperagent bg-supperagent';
                      }

                      return (
                        <div
                          key={optIndex}
                          onClick={() =>
                            !quizSubmitted &&
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [qIndex]: opt
                            }))
                          }
                          className={`
                            group relative flex cursor-pointer select-none items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 ease-in-out
                            ${containerStyle}
                          `}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${indicatorStyle}`}
                          >
                            {isSelected && (
                              <div
                                className={`h-2 w-2 rounded-full bg-current ${quizSubmitted ? 'bg-white' : 'bg-white'}`}
                              />
                            )}
                          </div>
                          <span className={`${textStyle} flex-1`}>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          )}
                          {quizSubmitted && isSelected && !isCorrect && (
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-end border-t border-slate-100 pt-8">
              {!quizSubmitted ? (
                <Button
                  onClick={() => setQuizSubmitted(true)}
                  size="lg"
                  className="min-w-[150px] bg-supperagent text-white shadow-lg shadow-indigo-200 hover:bg-supperagent/90"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  size="lg"
                  className="min-w-[150px] bg-supperagent text-white shadow-lg shadow-indigo-200 hover:bg-supperagent/90"
                >
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  // --- Loading State ---
  if (loading)
    return (
      <div className="container mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Skeleton className="h-[500px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );

  // --- Error State ---
  if (error)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="rounded-full bg-red-50 p-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );

  // --- NEW: No Data State ---
  if (!course)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="rounded-full bg-slate-200 p-4">
          <FileQuestion className="h-10 w-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          No Course Data Available
        </h2>
        <p className="text-slate-500">
          We couldn't find the course you are looking for.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );

  // --- Main Content ---
  return (
    <div className="min-h-screen bg-slate-50/80  text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full text-slate-500 hover:bg-supperagent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>
            <div>
              <h1 className="line-clamp-1 max-w-[200px] text-base font-bold text-slate-800 sm:max-w-md">
                {course?.title}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {currentLesson?.title
                  ? `Current: ${currentLesson.title}`
                  : 'Course Overview'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Main Content Area (8 cols) */}
          <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-8">
            {renderContent()}

            {/* Navigation Buttons */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6">
              <Button
                onClick={handlePrevLesson}
                disabled={
                  currentIndex <= 0 ||
                  (currentIndex > 0 && allLessons[currentIndex - 1]?.lock)
                }
                className="gap-2 rounded-full bg-supperagent px-6 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Lesson
              </Button>

              <Button
                onClick={handleNextLesson}
                disabled={
                  currentIndex >= allLessons.length - 1 ||
                  (currentIndex < allLessons.length - 1 &&
                    allLessons[currentIndex + 1]?.lock)
                }
                className="gap-2 rounded-full bg-supperagent px-6 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Next Lesson <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: Sidebar / Curriculum (4 cols) */}
          <div className="order-1 h-fit lg:order-2 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* --- Course Modules List Container --- */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {/* --- HEADER SECTION: Bold & Dark --- */}
                <div className="relative bg-slate-900 p-6 text-white">
                  {/* Decorative background glow using supperagent color */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-supperagent/20 blur-3xl"></div>
                  <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-supperagent/10 blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex flex-row items-end justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Current Progress
                        </span>
                        <h3 className="line-clamp-1 text-base font-bold tracking-wide text-white">
                          {currentModule ? currentModule.title : ''}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1">
                        <span className="text-xs font-bold text-supperagent">
                          {moduleStats.unlocked}
                        </span>
                        <span className="text-[10px] text-slate-500">/</span>
                        <span className="text-xs font-bold text-slate-400">
                          {moduleStats.total}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with Glow */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="absolute h-full rounded-full bg-supperagent shadow-[0_0_15px_currentColor] text-supperagent transition-all duration-700 ease-out"
                        style={{ width: `${moduleStats.percentage}%` }}
                      />
                    </div>

                    {/* Integrated Search Bar */}
                    <div className="group relative mt-6">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-supperagent transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search specific lesson..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 transition-all
                          focus:border-supperagent/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-supperagent/20"
                      />
                    </div>
                  </div>
                </div>

                {/* --- CONTENT LIST --- */}
                <div className="custom-scrollbar max-h-[calc(100vh-28rem)] overflow-y-auto bg-slate-50">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => {
                      const isExpanded = expandedModules.has(section._id);
                      const isActiveModule = section.lessonsList.some(
                        (l) => l._id === currentLesson?._id
                      );

                      return (
                        <div
                          key={section._id}
                          className="group/module border-b border-slate-200 bg-white last:border-0"
                        >
                          {/* Module Header (Accordion) */}
                          <button
                            onClick={() => toggleModule(section._id)}
                            className={`w-full px-5 py-4 text-left transition-colors duration-200 
                              ${isActiveModule ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded transition-colors ${isActiveModule ? 'bg-supperagent/10 text-supperagent' : 'bg-slate-100 text-slate-500'}`}
                              >
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <h4
                                  className={`text-sm font-bold leading-tight ${
                                    isActiveModule
                                      ? 'text-black'
                                      : 'text-slate-600 group-hover/module:text-slate-900'
                                  }`}
                                >
                                  {section.title}
                                </h4>
                                <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold">
                                  <span>{section.lessonsList.length} Lessons</span>
                                  <span className="h-1 w-1 rounded-full bg-black"></span>
                                  <span>
                                    {formatDuration(
                                      section.totalDurationMinutes
                                    )}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </button>

                          {/* Lessons List (Dropdown) */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded
                                ? 'max-h-[1000px] opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="flex flex-col bg-slate-50/50 pb-2 pt-1">
                              {section.lessonsList.map((lesson, idx) => {
                                const isActive =
                                  currentLesson?._id === lesson._id;

                                return (
                                  <button
                                    key={lesson._id}
                                    onClick={() => handleLessonClick(lesson)}
                                    disabled={lesson.lock}
                                    className={`relative mx-2 my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200
                                      ${
                                        isActive
                                          ? 'bg-white shadow-sm ring-1 ring-slate-200'
                                          : 'hover:bg-slate-200/50'
                                      }
                                      ${lesson.lock ? 'cursor-not-allowed opacity-60 grayscale' : ''}
                                    `}
                                  >
                                    {/* Active Indicator Strip */}
                                    {isActive && (
                                      <div className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r bg-supperagent"></div>
                                    )}

                                    {/* Icon Container */}
                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold shadow-sm transition-colors
                                      ${
                                        isActive
                                          ? 'border-supperagent/30 bg-supperagent/10 text-supperagent'
                                          : 'border-slate-200 bg-white text-slate-400'
                                      }`}
                                    >
                                      {lesson.lock ? (
                                        <Lock className="h-3.5 w-3.5" />
                                      ) : (
                                        <span>{idx + 1}</span>
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={`truncate text-xs ${
                                          isActive
                                            ? 'font-bold text-black'
                                            : 'font-medium text-slate-600'
                                        }`}
                                      >
                                        {lesson.title}
                                      </p>
                                      <div className="mt-0.5 flex items-center gap-2 font-bold">
                                        <span className="text-[10px] text-black font-bold">
                                          {lesson.type === 'video'
                                            ? 'Video'
                                            : lesson.type === 'quiz'
                                              ? 'Quiz'
                                              : 'Reading'}
                                        </span>
                                        <span className="text-[10px] text-black font-bold">
                                          •
                                        </span>
                                        <span className="text-[10px] text-black font-bold">
                                          {formatDuration(
                                            Number(lesson.duration)
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Playing Icon if Active */}
                                    {isActive && !lesson.lock && (
                                      <Play className="h-3 w-3 fill-supperagent text-supperagent" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No lessons found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try searching for something else
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}