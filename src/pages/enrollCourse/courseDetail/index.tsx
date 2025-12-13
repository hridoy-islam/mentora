import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Settings, 
  Download, 
  AlertCircle 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// Updated import path as requested
import axiosInstance from '@/lib/axios'; 

// --- 1. Defined Types based on your JSON Response ---

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
  duration: string; // JSON returns string "20", "100"
  index: number;
  lock: boolean; // JSON returns true/false
  videoUrl?: string;
  content?: string; // HTML content
  questions?: QuestionOption[];
  additionalFiles?: any[];
}

interface CourseModule {
  _id: string;
  title: string;
}

interface Section {
  _id: string; // Module ID
  title: string; // Module Title
  lessonsList: LessonData[];
  totalDurationMinutes: number;
}

interface CourseMetadata {
  _id: string;
  title: string;
  description?: string;
}

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- State ---
  const [course, setCourse] = useState<CourseMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  
  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Course Info
        const courseRes = await axiosInstance.get(`/courses/${id}`);
        setCourse(courseRes.data.data);

        // 2. Fetch Modules
        const modulesRes = await axiosInstance.get('/course-modules', {
          params: { courseId: id }
        });
        const modules: CourseModule[] = modulesRes.data.data.result;

        // 3. Fetch Lessons for Each Module
        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get('/course-lesson', {
              params: { moduleId: mod._id } // API filters by module
            });
            
            // The JSON array you provided is 'result'
            const rawLessons: LessonData[] = lessonsRes.data.data.result;

            // Sort by index to ensure order
            const sortedLessons = rawLessons.sort((a, b) => a.index - b.index);

            // Calculate duration
            const totalDuration = sortedLessons.reduce((acc, lesson) => {
              return acc + (parseInt(lesson.duration) || 0);
            }, 0);

            return {
              _id: mod._id,
              title: mod.title,
              lessonsList: sortedLessons,
              totalDurationMinutes: totalDuration
            };
          })
        );

        setSections(modulesWithLessons);

        // Auto-expand first module and select first available lesson
        if (modulesWithLessons.length > 0) {
          const firstModule = modulesWithLessons[0];
          setExpandedModules(new Set([firstModule._id]));
          
          const firstUnlocked = firstModule.lessonsList.find(l => !l.lock);
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
  }, [id]);

  // --- Logic Helpers ---

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lesson: LessonData) => {
    if (!lesson.lock) {
      setCurrentLesson(lesson);
      // Reset quiz state when changing lessons
      setSelectedAnswers({});
      setQuizSubmitted(false);
    }
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    // Simple regex to extract ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // --- Renderers ---

  const renderContent = () => {
    if (!currentLesson) return <div className="text-center p-10 text-gray-500">Select a lesson to begin</div>;

    // 1. VIDEO RENDERER
    if (currentLesson.type === 'video') {
      return (
        <Card className="overflow-hidden bg-black border-none ring-offset-0">
          <div className="relative aspect-video">
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
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                <p>Video URL not found</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white">
            <h2 className="text-xl font-bold">{currentLesson.title}</h2>
          </div>
        </Card>
      );
    }

    // 2. DOCUMENT RENDERER
    if (currentLesson.type === 'doc') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">{currentLesson.title}</h2>
            {/* Render HTML Content safely */}
            <div 
              className="prose ql-editor max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>No content available.</p>' }}
            />
            <div className="mt-10 pt-6 flex justify-end border-t">
              <Button className="gap-2">
                Mark as Read <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // 3. QUIZ RENDERER
    if (currentLesson.type === 'quiz') {
      return (
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
                <p className="text-sm text-gray-500">{currentLesson.questions?.length || 0} Questions</p>
              </div>
            </div>

            <div className="space-y-8">
              {currentLesson.questions?.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <h3 className="font-medium text-lg text-gray-900">
                    {qIndex + 1}. {q.question}
                  </h3>
                  <div className="space-y-2 pl-4">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedAnswers[qIndex] === opt;
                      // Simple logic to show correct/incorrect after submit
                      const isCorrect = q.correctAnswers.includes(opt);
                      let styleClass = "border-gray-200 hover:bg-gray-50";
                      
                      if (quizSubmitted) {
                        if (isCorrect) styleClass = "bg-green-50 border-green-500 text-green-700";
                        else if (isSelected && !isCorrect) styleClass = "bg-red-50 border-red-500 text-red-700";
                      } else if (isSelected) {
                        styleClass = "border-purple-600 bg-purple-50 text-purple-700";
                      }

                      return (
                        <div 
                          key={optIndex} 
                          onClick={() => !quizSubmitted && setSelectedAnswers(prev => ({...prev, [qIndex]: opt}))}
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${styleClass}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-600' : 'border-gray-300'}`}>
                             {isSelected && <div className="w-2 h-2 bg-purple-600 rounded-full" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 flex justify-end">
              {!quizSubmitted ? (
                <Button onClick={() => setQuizSubmitted(true)} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={() => { setSelectedAnswers({}); setQuizSubmitted(false); }} variant="outline" size="lg">
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
  };


  if (loading) return <div className="p-10 flex justify-center"><Skeleton className="w-full h-[600px] rounded-xl"/></div>;
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="text-xl font-semibold">{error}</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
                {currentLesson?.title || course?.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {renderContent()}

            {/* Navigation Buttons */}
            <div className='flex flex-row items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm'>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4"/> Previous
              </Button>
              <Button className="gap-2">
                Next Lesson <ChevronDown className="h-4 w-4 -rotate-90"/>
              </Button>
            </div>
          </div>

          {/* RIGHT: Sidebar / Curriculum */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 overflow-hidden border-gray-200 shadow-lg">
              <CardContent className="p-0">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900">{course?.title}</h3>
                </div>

                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                  {sections.map((section) => {
                    const isExpanded = expandedModules.has(section._id);
                    const isActiveModule = section.lessonsList.some(l => l._id === currentLesson?._id);

                    return (
                      <div key={section._id} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => toggleModule(section._id)}
                          className={`w-full p-4 text-left group transition-colors hover:bg-gray-50 ${isActiveModule ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${isActiveModule ? 'text-blue-700' : 'text-gray-800'}`}>
                                {section.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {section.totalDurationMinutes} mins • {section.lessonsList.length} Lessons
                              </p>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="bg-gray-50/50">
                            {section.lessonsList.map((lesson) => {
                              const isActive = currentLesson?._id === lesson._id;
                              
                              return (
                                <button
                                  key={lesson._id}
                                  onClick={() => handleLessonClick(lesson)}
                                  disabled={lesson.lock}
                                  className={`
                                    w-full py-3 pr-4 pl-10 flex items-start gap-3 text-left border-l-2 transition-all
                                    ${isActive ? 'border-blue-600 bg-white shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-600'}
                                    ${lesson.lock ? 'opacity-60 cursor-not-allowed' : ''}
                                  `}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {lesson.lock ? (
                                      <Lock className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      lesson.type === 'video' ? <Play className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} /> :
                                      lesson.type === 'quiz' ? <HelpCircle className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} /> :
                                      <FileText className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                      {lesson.title}
                                    </p>
                                    <span className="text-xs text-gray-400">{lesson.duration} min</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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