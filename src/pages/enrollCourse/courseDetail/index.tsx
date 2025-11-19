import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { courses, type Lesson, type LessonType } from '@/lib/courses';
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
  Download,
  Search // Added Search Icon
} from 'lucide-react';

export function CourseDetails() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  // Find Course
  const course = courses.find(c => c.id === Number(courseId));

  // State
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(
    course?.modules[0]?.lessons[0] || null
  );

  // --- ADDED useMemo back for header ---
  const currentModule = useMemo(() => {
    if (!course) return null;
    if (!currentLesson) return course.modules[0] || null;
    return course.modules.find(m => m.lessons.some(l => l.id === currentLesson.id)) || course.modules[0];
  }, [currentLesson, course]);

  const moduleProgress = useMemo(() => {
    if (!currentModule) return 0;
    const total = currentModule.lessons.length;
    if (total === 0) return 0;
    const completed = currentModule.lessons.filter(l => l.isCompleted).length;
    return Math.round((completed / total) * 100);
  }, [currentModule]);
  // --- END ---

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Course not found</div>;
  }

  // --- Logic Handlers ---

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
      // No need to scroll, sidebar is sticky
    }
  };

  const handleMarkComplete = () => {
    alert("Lesson completed! (API call would happen here)");
  };

  // --- Render Helpers ---

  // --- MODIFIED getLessonIcon ---
  const getLessonIcon = (type: LessonType, isCompleted: boolean, isLocked: boolean, isActive: boolean) => {
    if (isLocked) return <Lock className="h-4 w-4 text-slate-500" />;
    // Completed lessons show a green check
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-500" />;

    // Active or inactive icons
    const iconColor = isActive ? 'text-white' : 'text-slate-400';

    switch (type) {
      case 'video': return <Play className={`h-4 w-4 ${iconColor}`} />;
      case 'doc': return <FileText className={`h-4 w-4 ${iconColor}`} />;
      case 'quiz': return <HelpCircle className={`h-4 w-4 ${iconColor}`} />;
      default: return <Play className={`h-4 w-4 ${iconColor}`} />;
    }
  };

  const renderMainContent = () => {
    if (!currentLesson) return <div className="p-8 text-center text-gray-500">Select a lesson</div>;

    if (currentLesson.type === 'video') {
      return (
        <Card className="overflow-hidden bg-black border-none">
          <div className="relative aspect-video">
            <div className="w-full h-full flex items-center justify-center flex-col">
              <div className="w-20 h-20 bg-blue-600/90 hover:bg-blue-600 rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all transform hover:scale-105">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-1">{currentLesson.title}</h3>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Play className="h-5 w-5 text-white cursor-pointer" />
                  <Volume2 className="h-5 w-5 text-white cursor-pointer" />
                  <div className="h-1 w-24 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-blue-500"></div>
                  </div>
                  <span className="text-xs text-white">05:30 / {currentLesson.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-white cursor-pointer" />
                  <Maximize className="h-5 w-5 text-white cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (currentLesson.type === 'doc') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            {/* <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
                <p className="text-sm text-gray-500">{currentLesson.duration} read</p>
              </div>
            </div> */}
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {currentLesson.content || "Content is loading..."}
            </div>
            <div className="mt-10 pt-6 flex justify-end">
              <Button onClick={handleMarkComplete} className="gap-2">
                Mark as Read <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentLesson.type === 'quiz') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 ">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-supperagent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
                <p className="text-sm text-gray-500">{currentLesson.questions?.length} Questions</p>
              </div>
            </div>
            <div className="space-y-8">
              {currentLesson.questions?.map((q, index) => (
                <div key={q.id} className="space-y-3">
                  <h3 className="font-medium text-lg text-gray-900">{index + 1}. {q.question}</h3>
                  <div className="space-y-2 pl-4">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name={`question-${q.id}`} className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 flex justify-end">
              <Button onClick={handleMarkComplete} size="lg" className="bg-supperagent hover:bg-purple-700">Submit Quiz</Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="">
      {/* Top Header */}
      <div className="bg-white sticky top-0 z-40 ">
        <div className="container mx-auto py-3">
          <div className="flex items-center gap-4">
            <Button variant="default" size="sm" onClick={() => navigate(-1)} className="-ml-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {currentLesson?.title || "Loading..."}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE: Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {renderMainContent()}

            <div className='flex flex-row items-center justify-end gap-4'>
              <Button className=''>Previous</Button>

              <Button>Next</Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {currentLesson?.type === 'video' && (
                  <div className="pt-4 ">

                    <div className="flex gap-3">
                      <Button variant="default" size="sm" className="text-xs items-center flex flex-row gap-2"> <Download className="h-4 w-4" />Source Code.zip</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* --- MODIFIED: RIGHT SIDE: Curriculum / Sidebar --- */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 overflow-hidden">
              <CardContent className="p-4">
                {/* 1. Header (Current Module Progress) */}
                {currentModule && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">
                        Running Module: {course.modules.indexOf(currentModule) + 1}
                      </p>
                      <p className="text-sm font-medium text-gray-500">
                        {currentModule.lessons.filter(l => l.isCompleted).length} / {currentModule.lessons.length}
                      </p>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-supperagent transition-all duration-500"
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Search Bar (optional) */}
                {/* <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search Lesson"
          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div> */}

                {/* 3. Module List */}
                <div className="max-h-[calc(100vh-18rem)] overflow-y-auto space-y-3">
                  {course.modules.map((module, moduleIndex) => {
                    const total = module.lessons.length;
                    const completed = module.lessons.filter(l => l.isCompleted).length;
                    const isActiveModule = module.lessons.some(l => l.id === currentLesson?.id);

                    const totalDuration = module.lessons.reduce((acc, lesson) => {
                      if (lesson.duration.includes('min')) {
                        return acc + (parseInt(lesson.duration) || 0);
                      }
                      return acc;
                    }, 0);

                    return (
                      <Card key={module.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        {/* Module Header Button */}
                        <button
                          onClick={() => toggleModule(moduleIndex)}
                          className="w-full p-4 text-left group"
                        >
                          <div className="flex items-center justify-between w-full">
                            <h4 className={`font-semibold text-sm flex-1 pr-4 ${isActiveModule ? 'text-supperagent' : 'text-gray-800'}`}>
                              {module.title}
                            </h4>
                            {expandedModules.has(moduleIndex) ?
                              <ChevronUp className="h-5 w-5 text-gray-400" /> :
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            }
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {totalDuration > 0 && `${totalDuration} min •`} {completed}/{total}
                          </p>
                        </button>

                        {/* Expanded Lesson List */}
                        {expandedModules.has(moduleIndex) && (
                          <div className="pt-2 border-t border-gray-200">
                            {module.lessons.map((lesson) => {
                              const isActive = currentLesson?.id === lesson.id;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(lesson)}
                                  disabled={lesson.isLocked}
                                  className={`
                          w-full px-4 py-3 flex items-start gap-3 transition-all text-left
                          ${isActive
                                      ? 'bg-supperagent/10 text-supperagent rounded-md m-1'
                                      : 'hover:bg-gray-100 text-gray-700'
                                    }
                          ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                                >
                                  <div className="flex-shrink-0 mt-1">
                                    {getLessonIcon(lesson.type, !!lesson.isCompleted, !!lesson.isLocked, isActive)}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${isActive ? 'text-supperagent' : 'text-gray-800'}`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs ${isActive ? 'text-supperagent' : 'text-gray-500'}`}>
                                        {lesson.duration}
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
          {/* --- END MODIFIED SIDEBAR --- */}

        </div>
      </div>
    </div>
  );
}