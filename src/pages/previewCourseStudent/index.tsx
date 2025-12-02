import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Assuming you have an axios instance setup. If not, import axios directly.
import axiosInstance from '@/lib/axios'; // Adjust path as needed
import { toast } from '@/components/ui/use-toast'; // Adjust path as needed
import 'react-quill/dist/quill.snow.css';
import {
  Play,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  FileText,
  HelpCircle,
  Maximize,
  Volume2,
  Settings,
  Download
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// Type definitions based on your Mongoose models and UI needs
type Question = {
  id?: string;
  _id?: string;
  question: string;
  options: string[];
  correctAnswers?: string[];
};

type Lesson = {
  _id: string;
  title: string;
  duration: string;
  type: 'video' | 'doc' | 'quiz';
  isLocked: boolean;
  isCompleted: boolean; // You might need to fetch this from a progress endpoint
  videoUrl?: string;
  content?: string;
  questions?: Question[];
  additionalFiles?: string[];
  additionalNote?: string;
};

type Module = {
  _id?: string; // Module ID might be needed
  title: string;
  lessonsCount: number;
  hours: string;
  lessonsList: Lesson[];
};

const formatDuration = (duration: string) => {
  if (!duration) return '—';
  const parts = duration.split(':').map(Number);

  if (parts.length === 2) {
    // mm:ss
    let minutes = parts[0];
    const seconds = parts[1];
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return minutes > 0 ? `${minutes}min` : `${seconds}s`;
  } else if (parts.length === 3) {
    // hh:mm:ss
    const hours = parts[0];
    const minutes = parts[1];
    return hours > 0
      ? minutes > 0
        ? `${hours}h ${minutes}min`
        : `${hours}h`
      : `${minutes}min`;
  } else {
    const mins = Number(duration);
    return isNaN(mins)
      ? '—'
      : mins >= 60
      ? `${Math.floor(mins / 60)}h ${mins % 60}min`
      : `${mins}min`;
  }
};

export function PreviewStudentCourseDetailsPage() {
  const { cid } = useParams();
  const navigate = useNavigate();

  // State
  const [sections, setSections] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null); // Kept for logic, prefixed _ to suppress unused warning if not rendered
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set([0])
  );

  // --- FETCH DATA EFFECT ---
  useEffect(() => {
    const fetchData = async () => {
      if (!cid) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Course Details (Optional: Set course title state if needed)
        // const courseRes = await axiosInstance.get(`/courses/${cid}`);
        // const courseData = courseRes.data.data;

        // 2. Fetch Modules
        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: cid }
        });
        const modules: any[] = modulesRes.data.data.result;

        // 3. Fetch Lessons for each module
        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get('/course-lesson', {
              params: { moduleId: mod._id }
            });
            const lessons: any[] = lessonsRes.data.data.result.sort(
              (a, b) => a.index - b.index
            );
            return { module: mod, lessons };
          })
        );

        // 4. Transform Data for UI
        const transformedSections: Module[] = modulesWithLessons.map(
          ({ module, lessons }) => {
            const totalMinutes = lessons.reduce((sum, lesson) => {
              if (!lesson.duration) return sum;
              const parts = lesson.duration.toString().split(':').map(Number);
              if (parts.length === 2) return sum + parts[0];
              if (parts.length === 3) return sum + parts[0] * 60 + parts[1];
              return (
                sum +
                (isNaN(Number(lesson.duration)) ? 0 : Number(lesson.duration))
              );
            }, 0);

            return {
              _id: module._id,
              title: module.title,
              lessonsCount: lessons.length,
              hours:
                totalMinutes / 60 >= 1 ? (totalMinutes / 60).toFixed(1) : '<1',
              lessonsList: lessons.map((lesson) => ({
                _id: lesson._id,
                title: lesson.title,
                duration: lesson.duration || '—',
                type: lesson.type,
                isLocked: false,
                isCompleted: false, // TODO: Merge with user progress data
                videoUrl: lesson.videoUrl,
                content: lesson.content,
                questions: lesson.questions,
                additionalFiles: lesson.additionalFiles,
                additionalNote: lesson.additionalNote
              }))
            };
          }
        );

        setSections(transformedSections);

        // Auto-select first lesson if none selected
        if (
          transformedSections.length > 0 &&
          transformedSections[0].lessonsList.length > 0
        ) {
          setCurrentLesson(transformedSections[0].lessonsList[0]);
        }
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

  // --- DERIVED STATE ---

  // Find which module the current lesson belongs to
  const currentModuleIndex = useMemo(() => {
    if (!currentLesson || sections.length === 0) return -1;
    return sections.findIndex((section) =>
      section.lessonsList.some((lesson) => lesson._id === currentLesson._id)
    );
  }, [currentLesson, sections]);

  const currentModule = useMemo(() => {
    if (currentModuleIndex === -1) return null;
    return sections[currentModuleIndex];
  }, [sections, currentModuleIndex]);

  const moduleProgress = useMemo(() => {
    if (!currentModule) return 0;
    const total = currentModule.lessonsList.length;
    if (total === 0) return 0;
    const completed = currentModule.lessonsList.filter(
      (l) => l.isCompleted
    ).length;
    return Math.round((completed / total) * 100);
  }, [currentModule]);

  // --- HANDLERS ---

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
    }
  };

  const handleMarkComplete = () => {
    alert('Lesson completed! (API call would happen here)');
    // Here you would optimally update the `sections` state to mark currentLesson as isCompleted: true
  };

  // --- NEXT / PREVIOUS LOGIC ---

  const handleNext = () => {
    if (!currentLesson || currentModuleIndex === -1) return;

    const currentLessonIndex = sections[
      currentModuleIndex
    ].lessonsList.findIndex((l) => l._id === currentLesson._id);

    // 1. Try to go to next lesson in current module
    if (
      currentLessonIndex <
      sections[currentModuleIndex].lessonsList.length - 1
    ) {
      const nextLesson =
        sections[currentModuleIndex].lessonsList[currentLessonIndex + 1];
      if (!nextLesson.isLocked) {
        setCurrentLesson(nextLesson);
      } else {
        toast({
          title: 'Locked',
          description: 'The next lesson is locked.',
          variant: 'default'
        });
      }
    }
    // 2. Try to go to first lesson of next module
    else if (currentModuleIndex < sections.length - 1) {
      const nextModuleIndex = currentModuleIndex + 1;
      const nextLesson = sections[nextModuleIndex].lessonsList[0];

      if (nextLesson && !nextLesson.isLocked) {
        // Auto expand the new module
        const newExpanded = new Set(expandedModules);
        newExpanded.add(nextModuleIndex);
        setExpandedModules(newExpanded);

        setCurrentLesson(nextLesson);
      } else if (nextLesson?.isLocked) {
        toast({
          title: 'Locked',
          description: 'The next module is locked.',
          variant: 'default'
        });
      }
    }
  };

  const handlePrevious = () => {
    if (!currentLesson || currentModuleIndex === -1) return;

    const currentLessonIndex = sections[
      currentModuleIndex
    ].lessonsList.findIndex((l) => l._id === currentLesson._id);

    // 1. Try to go to previous lesson in current module
    if (currentLessonIndex > 0) {
      setCurrentLesson(
        sections[currentModuleIndex].lessonsList[currentLessonIndex - 1]
      );
    }
    // 2. Try to go to last lesson of previous module
    else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModuleLessons = sections[prevModuleIndex].lessonsList;
      const prevLesson = prevModuleLessons[prevModuleLessons.length - 1];

      if (prevLesson) {
        // Auto expand the previous module
        const newExpanded = new Set(expandedModules);
        newExpanded.add(prevModuleIndex);
        setExpandedModules(newExpanded);

        setCurrentLesson(prevLesson);
      }
    }
  };

  // --- RENDER HELPERS ---

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );

  const getLessonIcon = (
    type: string,
    isCompleted: boolean,
    isLocked: boolean,
    isActive: boolean
  ) => {
    if (isLocked) return <Lock className="h-4 w-4 text-slate-500" />;
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-500" />;

    const iconColor = isActive ? 'text-white' : 'text-slate-400';

    switch (type) {
      case 'video':
        return <Play className={`h-4 w-4 ${iconColor}`} />;
      case 'doc':
        return <FileText className={`h-4 w-4 ${iconColor}`} />;
      case 'quiz':
        return <HelpCircle className={`h-4 w-4 ${iconColor}`} />;
      default:
        return <Play className={`h-4 w-4 ${iconColor}`} />;
    }
  };

  const renderMainContent = () => {
    // if (loading)
    //   return <div className="p-20 text-center">Loading course content...</div>;
    // if (!currentLesson)
    //   return (
    //     <div className="p-8 text-center text-gray-500">Select a lesson</div>
    //   );

    if (currentLesson?.type === 'video') {
      return (
        <Card className="overflow-hidden border-none bg-black">
          <div className="relative aspect-video">
            {/* If videoUrl exists, usually you render an iframe or video tag here. 
                 Using the placeholder UI as per request, but wired to title. */}
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="mb-4 flex h-20 w-20 transform cursor-pointer items-center justify-center rounded-full bg-blue-600/90 transition-all hover:scale-105 hover:bg-blue-600">
                <Play className="ml-1 h-8 w-8 text-white" />
              </div>
              <h3 className="mb-1 text-xl font-semibold text-white">
                {currentLesson.title}
              </h3>
              {/* Optional: Render real video if URL exists */}
              {/* {currentLesson.videoUrl && <video src={currentLesson.videoUrl} controls className="absolute inset-0 w-full h-full object-cover" />} */}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Play className="h-5 w-5 cursor-pointer text-white" />
                  <Volume2 className="h-5 w-5 cursor-pointer text-white" />
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-600">
                    <div className="h-full w-1/3 bg-blue-500"></div>
                  </div>
                  <span className="text-xs text-white">
                    00:00 / {currentLesson.duration || '00:00'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 cursor-pointer text-white" />
                  <Maximize className="h-5 w-5 cursor-pointer text-white" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (currentLesson?.type === 'doc') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            <div
              className="ql-editor course-content prose prose-blue max-w-none leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{
                __html: currentLesson.content || '<p>No content available.</p>'
              }}
            />

            <div className="mt-4 flex justify-end ">
              <Button onClick={handleMarkComplete} className="gap-2">
                Mark as Read <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentLesson?.type === 'quiz') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3 pb-6 ">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <HelpCircle className="h-5 w-5 text-supperagent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentLesson.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentLesson.questions?.length || 0} Questions
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {currentLesson.questions?.map((q, index) => (
                <div key={q._id || index} className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 1}. {q.question}
                  </h3>
                  <div className="space-y-2 pl-4">
                    {q.options?.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={`question-${q._id || index}`}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-end pt-6">
              <Button
                onClick={handleMarkComplete}
                size="lg"
                className="bg-supperagent hover:bg-supperagent/90"
              >
                Submit Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  if (!cid) return <div>Invalid Course ID</div>;

  return (
    <div className="container mx-auto py-6">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white ">
        <div className=" py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(-1)}
              className="-ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="mx-2 h-6 w-px bg-gray-200"></div>
            <div className="flex-1">
              <h1 className="line-clamp-1 text-lg font-semibold text-gray-900">
                {currentLesson?.title || 'Loading...'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 ">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT SIDE: Main Content Area */}
          <div className="space-y-4 lg:col-span-2">
            {renderMainContent()}

            <div className="flex flex-row items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={
                  !currentLesson ||
                  (currentModuleIndex === 0 &&
                    sections[0]?.lessonsList.indexOf(currentLesson) === 0)
                }
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                // Disable if last lesson of last module
                disabled={
                  !currentLesson ||
                  (currentModuleIndex === sections.length - 1 &&
                    sections[currentModuleIndex]?.lessonsList.indexOf(
                      currentLesson
                    ) ===
                      sections[currentModuleIndex]?.lessonsList.length - 1)
                }
              >
                Next
              </Button>
            </div>
            {(currentLesson?.additionalNote ||
              (currentLesson?.additionalFiles &&
                currentLesson.additionalFiles.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lesson Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 1. Show Additional Note if available */}
                  {currentLesson.additionalNote && (
                    <div className="rounded-md border border-yellow-100 bg-yellow-50 p-4">
                      <h4 className="mb-1 text-sm font-semibold">
                        Note:
                      </h4>

                      <div
                        className="ql-editor course-content prose prose-blue max-w-none leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html:
                            currentLesson.additionalNote ||
                            '<p>No content available.</p>'
                        }}
                      />
                    </div>
                  )}

                  {/* 2. Show Additional Files if available */}
                  {currentLesson.additionalFiles &&
                    currentLesson.additionalFiles.length > 0 && (
                      <div>
                        {currentLesson.additionalNote && (
                          <div className="my-4 h-px w-full bg-gray-100" />
                        )}
                        <h4 className="mb-3 text-sm font-medium text-gray-700">
                          Attached Material:
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {currentLesson.additionalFiles.map((file, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="flex flex-row items-center gap-2 bg-white text-xs"
                              onClick={() => window.open(file, '_blank')} // Assuming string is a URL
                            >
                              <Download className="h-4 w-4 text-supperagent" />
                              Download Material {idx + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDE: Curriculum / Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 overflow-hidden">
              <CardContent className="p-4">
                {/* 1. Header (Current Module Progress) */}
                {currentModule && (
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Running Module: {currentModuleIndex + 1}
                      </p>
                      <p className="text-sm font-medium text-gray-500">
                        {
                          currentModule.lessonsList.filter((l) => l.isCompleted)
                            .length
                        }{' '}
                        / {currentModule.lessonsList.length}
                      </p>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-supperagent transition-all duration-500"
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Module List */}
                <div className="max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto">
                  {sections.map((module, moduleIndex) => {
                    const total = module.lessonsList.length;
                    const completed = module.lessonsList.filter(
                      (l) => l.isCompleted
                    ).length;
                    const isActiveModule = module.lessonsList.some(
                      (l) => l._id === currentLesson?._id
                    );

                    // Ensure duration is treated as string for display, or parsed for calculation if needed
                    const totalDuration = parseFloat(module.hours) * 60;

                    return (
                      <Card
                        key={module._id || moduleIndex}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                      >
                        {/* Module Header Button */}
                        <button
                          onClick={() => toggleModule(moduleIndex)}
                          className="group w-full p-4 text-left"
                        >
                          <div className="flex w-full items-center justify-between">
                            <h4
                              className={`flex-1 pr-4 text-sm font-semibold ${isActiveModule ? 'text-supperagent' : 'text-gray-800'}`}
                            >
                              {module.title}
                            </h4>
                            {expandedModules.has(moduleIndex) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {/* Display logic for duration can be adjusted based on exact string format */}
                            {module.lessonsCount} Lessons • {completed}/{total}{' '}
                            Completed
                          </p>
                        </button>

                        {/* Expanded Lesson List */}
                        {expandedModules.has(moduleIndex) && (
                          <div className="border-t border-gray-200 pt-2">
                            {module.lessonsList.map((lesson) => {
                              const isActive =
                                currentLesson?._id === lesson._id;
                              return (
                                <button
                                  key={lesson._id}
                                  onClick={() => handleLessonClick(lesson)}
                                  disabled={lesson.isLocked}
                                  className={`
                          flex w-full items-start gap-3 px-4 py-3 text-left transition-all
                          ${
                            isActive
                              ? 'm-1 rounded-md bg-supperagent/10 text-supperagent'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                          ${lesson.isLocked ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                                >
                                  <div className="mt-1 flex-shrink-0">
                                    {getLessonIcon(
                                      lesson.type,
                                      !!lesson.isCompleted,
                                      !!lesson.isLocked,
                                      isActive
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-medium ${isActive ? 'text-supperagent' : 'text-gray-800'}`}
                                    >
                                      {lesson.title}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span
                                        className={`text-xs ${isActive ? 'text-supperagent' : 'text-gray-500'}`}
                                      >
                                        {formatDuration(lesson.duration)}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
