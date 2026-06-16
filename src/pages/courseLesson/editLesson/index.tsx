import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MoveLeft,
  Upload,
  Video,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  X,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Settings,
  MinusCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axiosInstance from '@/lib/axios';
import Select from 'react-select';
import { useToast } from '@/components/ui/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// --- Dialog Component ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { cn } from '@/lib/utils';

// --- Interfaces ---
interface LessonOption {
  value: string;
  label: string;
}

interface QuizQuestion {
  _id?: string;
  tempId?: string;
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correctAnswers?: string[];
  isImported?: boolean;
}

interface QuizConfig {
  totalMarks: number;
  passMarks: number;
}

interface UploadedFile {
  name: string;
  url: string;
}

interface FormData {
  title: string;
  videoUrl: string;
  content: string;
  questions: QuizQuestion[];
  quizConfig?: QuizConfig;
  additionalFiles?: string[];
  additionalNote?: string;
  importedQuestions: string[];
  duration: number;
}

interface QuestionBank {
  _id: string;
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correctAnswers?: string[];
  shortAnswer?: string;
}

// --- DnD Logic (Unchanged) ---
const ItemType = 'QUESTION';

interface QuestionItemProps {
  id: string;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
  onDelete: () => void;
  isImported?: boolean;
}

const QuestionItem = ({
  id,
  index,
  moveQuestion,
  children,
  onDelete,
  isImported = false
}: QuestionItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => ({ id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });
  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`group relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 pt-8 transition-all hover:border-supperagent ${isDragging ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
    >
      <div className="absolute right-1 top-1 z-10 opacity-100 transition-opacity">
        <Button
          type="button"
          onClick={onDelete}
          className="bg-white text-red-500 shadow-none hover:bg-gray-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mr-4 flex gap-4">
        <div className="mt-2 cursor-move text-gray-300 hover:text-gray-500">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-4">{children}</div>
      </div>
    </div>
  );
};

// --- Import Questions Dialog (Unchanged) ---
interface ImportQuestionsDialogProps {
  onImport: (questions: QuizQuestion[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingImportedQuestions: string[];
}

const ImportQuestionsDialog = ({
  onImport,
  open,
  onOpenChange,
  existingImportedQuestions
}: ImportQuestionsDialogProps) => {
  const [questionType, setQuestionType] = useState<'mcq' | 'short'>('mcq');
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuestions = async (
    type: 'mcq' | 'short',
    page: number,
    limit: number,
    search: string = ''
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/questions?type=${type}`, {
        params: { page, limit, ...(search ? { searchTerm: search } : {}) }
      });
      setTotalPages(response.data.data.meta.totalPage || 1);
      setQuestions(response.data.data.result || []);
    } catch (error) {
      toast({ title: 'Failed to fetch questions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQuestions(questionType, currentPage, entriesPerPage, searchTerm);
      setSelectedQuestions([...existingImportedQuestions]);
    }
  }, [open, questionType, currentPage, entriesPerPage, searchTerm]);

  useEffect(() => {
    if (!open) setSelectedQuestions([]);
  }, [open]);

  const handleQuestionTypeChange = (type: 'mcq' | 'short') => {
    setQuestionType(type);
    setCurrentPage(1);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSearch = () => setCurrentPage(1);

  const handleImport = () => {
    const newSelectedQuestions = selectedQuestions.filter(
      id => !existingImportedQuestions.includes(id)
    );
    if (newSelectedQuestions.length === 0) {
      toast({
        title: 'No New Questions Selected',
        description: 'All selected questions are already part of this lesson.',
        variant: 'default'
      });
      onOpenChange(false);
      return;
    }
    const selectedQuestionData = questions.filter((q) =>
      newSelectedQuestions.includes(q._id)
    );
    const importedQuestions: QuizQuestion[] = selectedQuestionData.map((q) => ({
      _id: q._id,
      tempId: `imported-${q._id}-${Date.now()}`,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswers: q.correctAnswers,
      isImported: true
    }));
    onImport(importedQuestions);
    onOpenChange(false);
    toast({
      title: 'Questions Imported',
      description: `Successfully imported ${importedQuestions.length} questions.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-[90vh] max-w-7xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import Questions from Question Bank</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by question"
            className="h-8 min-w-[300px]"
          />
          <Button onClick={handleSearch} size="sm" className="min-w-[100px] border-none bg-supperagent text-white hover:bg-supperagent/90">
            Search
          </Button>
        </div>
        <div className="mb-6 flex gap-4">
          <Button
            type="button"
            variant={questionType === 'mcq' ? 'default' : 'outline'}
            onClick={() => handleQuestionTypeChange('mcq')}
            className={questionType === 'mcq' ? 'bg-supperagent text-white hover:bg-supperagent/90' : ''}
          >
            MCQ Questions
          </Button>
          <Button
            type="button"
            variant={questionType === 'short' ? 'default' : 'outline'}
            onClick={() => handleQuestionTypeChange('short')}
            className={questionType === 'short' ? 'bg-supperagent text-white hover:bg-supperagent/90' : ''}
          >
            Short Answer Questions
          </Button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-supperagent"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No {questionType} questions found in the question bank.
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question._id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  selectedQuestions.includes(question._id)
                    ? 'border-supperagent bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  existingImportedQuestions.includes(question._id)
                    ? 'bg-green-50'
                    : ''
                }`}
                onClick={() => toggleQuestionSelection(question._id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-4 w-4 items-center justify-center rounded border ${
                      selectedQuestions.includes(question._id)
                        ? 'border-supperagent bg-supperagent'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedQuestions.includes(question._id) && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    {existingImportedQuestions.includes(question._id) && (
                      <div className="mb-2 inline-flex items-center rounded-full bg-supperagent px-2 py-1 text-xs font-medium text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Already Imported
                      </div>
                    )}
                    <h4 className="font-medium text-gray-900">{question.question}</h4>
                    {question.type === 'mcq' && question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`text-sm ${
                              question.correctAnswers?.includes(option)
                                ? 'font-medium text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                            {question.correctAnswers?.includes(option) && (
                              <span className="ml-2 text-xs text-green-600">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'short' && (
                      <p className="mt-1 text-sm text-gray-500">Short answer question</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            {selectedQuestions.filter(id => !existingImportedQuestions.includes(id)).length} new question(s) selected
            {existingImportedQuestions.length > 0 && (
              <span className="ml-2 text-supperagent">
                ({existingImportedQuestions.length} already imported)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedQuestions.filter(id => !existingImportedQuestions.includes(id)).length === 0}
              className="bg-supperagent text-white hover:bg-supperagent/90"
            >
              Import Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Helper function to extract file name from URL ---
const getFileNameFromUrl = (url: string, index: number): string => {
  let fileName = url.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
  fileName = fileName.replace(/^\d+-/, '');
  return fileName;
};

// --- Helper function to check if URL is from Google Storage ---
const isGoogleStorageUrl = (url: string): boolean => {
  return url?.startsWith('https://storage.googleapis.com') || false;
};

// --- Main Edit Component ---
export default function EditLessonPage() {
  const navigate = useNavigate();
  const { cid, mid, id: lessonId } = useParams<{ cid: string; mid: string; id: string }>();
  const [loading, setLoading] = useState(false);
  const [lessonType, setLessonType] = useState<'video' | 'doc' | 'quiz'>('video');
  const [videoMethod, setVideoMethod] = useState<'link' | 'upload'>('link');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [prerequisiteLoading, setPrerequisiteLoading] = useState(false);
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [selectedPrerequisite, setSelectedPrerequisite] = useState<LessonOption | null>(null);
  
  // Document Upload States
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Upload States
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<UploadedFile | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const [additionalNote, setAdditionalNote] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    videoUrl: '',
    content: '',
    questions: [],
    quizConfig: { totalMarks: 0, passMarks: 0 },
    importedQuestions: [],
    additionalFiles: [],
    duration: 0
  });

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        const res = await axiosInstance.get(`/course-lesson/${lessonId}`);
        const lesson = res.data.data;

        // --- Map local questions (editable) ---
        const localQuestions: QuizQuestion[] = (lesson.questions || []).map((q: any) => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswers: q.correctAnswers,
          isImported: false,
        }));

        // --- Map imported questions (read-only) ---
        const importedQuestions: QuizQuestion[] = (lesson.importedQuestions || []).map((q: any) => ({
          _id: q._id,
          tempId: `imported-${q._id}`,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswers: q.correctAnswers,
          isImported: true,
        }));

        // --- Map uploaded files from additionalFiles ---
        const existingFiles: UploadedFile[] = (lesson.additionalFiles || []).map((url: string, index: number) => ({
          url: url,
          name: getFileNameFromUrl(url, index)
        }));

        setUploadedFiles(existingFiles);

        // --- Determine video method based on URL ---
        const videoUrl = lesson.videoUrl || '';
        const isStorageUrl = isGoogleStorageUrl(videoUrl);
        
        // If the URL is from Google Storage, treat it as a direct upload
        if (videoUrl && isStorageUrl) {
          setVideoMethod('upload');
          setVideoFile({
            url: videoUrl,
            name: getFileNameFromUrl(videoUrl, 0)
          });
          setVideoPreview(videoUrl);
        } else if (videoUrl && !videoUrl.startsWith('blob:')) {
          setVideoMethod('link');
        } else if (videoUrl && videoUrl.startsWith('blob:')) {
          setVideoMethod('upload');
        }

        // --- Set form data ---
        setFormData({
          title: lesson.title || '',
          videoUrl: lesson.videoUrl || '',
          content: lesson.content || '',
          duration: lesson.duration || 0,
          quizConfig: lesson.quizConfig || { totalMarks: 0, passMarks: 0 },
          additionalFiles: lesson.additionalFiles || [],
          additionalNote: lesson.additionalNote || '',
          questions: [...localQuestions, ...importedQuestions],
          importedQuestions: (lesson.importedQuestions || []).map((q: any) => q._id),
        });

        setLessonType(lesson.type);
        setAdditionalNote(lesson.additionalNote || '');

        // --- Fetch prerequisite lessons for dropdown ---
        if (mid) {
          const lessonsRes = await axiosInstance.get(`/course-lesson?moduleId=${mid}&limit=all`);
          const lessons = lessonsRes.data.data.result;
          const options = lessons.map((l: any) => ({ value: l._id, label: l.title }));
          setLessonOptions(options);
        }

        // --- Set prerequisite selection ---
        if (lesson.prerequisiteLesson) {
          setSelectedPrerequisite({
            value: typeof lesson.prerequisiteLesson === 'string'
              ? lesson.prerequisiteLesson
              : lesson.prerequisiteLesson?._id,
            label: typeof lesson.prerequisiteLesson === 'object'
              ? lesson.prerequisiteLesson.title
              : 'Unknown Lesson',
          });
        }
      } catch (err) {
        console.error(err);
        toast({ title: 'Failed to load lesson', variant: 'destructive' });
      }
    };

    fetchLesson();
  }, [lessonId, mid]);

  // --- Document Upload Handlers ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate all files first
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(`File too large: ${file.name}. Must be less than 20MB.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('entityId', mid || '');
        formData.append('file_type', 'document');
        formData.append('file', file);

        const res = await axiosInstance.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return { name: file.name, url: res.data?.data?.fileUrl };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...uploadedResults]);
      
      // Update formData.additionalFiles with new URLs
      setFormData(prev => ({
        ...prev,
        additionalFiles: [...(prev.additionalFiles || []), ...uploadedResults.map(f => f.url)]
      }));

      toast({
        title: 'Files Uploaded',
        description: `Successfully uploaded ${uploadedResults.length} file(s).`
      });
    } catch (err) {
      setUploadError('Failed to upload one or more documents.');
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload one or more documents.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = uploadedFiles[indexToRemove];
    setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFormData(prev => ({
      ...prev,
      additionalFiles: prev.additionalFiles?.filter((url) => url !== fileToRemove.url)
    }));
  };

  // --- Video Upload Handlers ---
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      setVideoUploadError('Please select a valid video file!');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setVideoUploadError('File size exceeds 100MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setVideoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsVideoUploading(true);
    setVideoUploadError(null);

    try {
      const formData = new FormData();
      formData.append('entityId', mid || '');
      formData.append('file_type', 'video');
      formData.append('file', file);

      const res = await axiosInstance.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedVideo = {
        name: file.name,
        url: res.data?.data?.fileUrl
      };

      setVideoFile(uploadedVideo);
      setFormData((prev) => ({
        ...prev,
        videoUrl: uploadedVideo.url
      }));

      toast({
        title: 'Video Uploaded',
        description: 'Video uploaded successfully.'
      });
    } catch (err) {
      setVideoUploadError('Failed to upload video.');
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload video.',
        variant: 'destructive'
      });
      setVideoPreview(null);
    } finally {
      setIsVideoUploading(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setFormData((prev) => ({
      ...prev,
      videoUrl: ''
    }));
    setVideoUploadError(null);
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  // Handlers (mostly same as Create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const importedQuestions = formData.questions.filter(q => q.isImported);
    const regularQuestions = formData.questions.filter(q => !q.isImported);
    const cleanedRegularQuestions = regularQuestions.map(({ tempId, ...rest }) => rest);
    const importedQuestionIds = importedQuestions.filter(q => q._id).map(q => q._id!);

    const payload: any = {
      ...formData,
      moduleId: mid,
      questions: lessonType === 'quiz' ? cleanedRegularQuestions : undefined,
      importedQuestions: lessonType === 'quiz' ? importedQuestionIds : undefined,
      quizConfig: lessonType === 'quiz' ? formData.quizConfig : undefined,
      type: lessonType,
      prerequisiteLesson: selectedPrerequisite?.value || null,
      additionalNote: additionalNote || undefined,
      additionalFiles: uploadedFiles.map((file) => file.url),
    };

    try {
      await axiosInstance.patch(`/course-lesson/${lessonId}`, payload);
      toast({ title: 'Lesson Updated', description: 'Your changes have been saved.' });
      navigate(-1);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Update failed';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportQuestions = (importedQuestions: QuizQuestion[]) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ...importedQuestions]
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          tempId: `new-${Date.now()}`,
          question: '',
          type: 'mcq',
          options: ['', '', '', ''],
          correctAnswers: [],
          isImported: false
        }
      ]
    }));
  };

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const [dragged] = newQuestions.splice(dragIndex, 1);
      newQuestions.splice(hoverIndex, 0, dragged);
      return { ...prev, questions: newQuestions };
    });
  }, []);

  const updateQuestion = (index: number, field: string, value: any) => {
    if (formData.questions[index].isImported) {
      toast({
        title: 'Cannot Edit Imported Question',
        description: 'Imported questions are read-only. Please edit them in the question bank.',
        variant: 'destructive'
      });
      return;
    }
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'type' && value === 'short') {
      updated[index].options = undefined;
      updated[index].correctAnswers = undefined;
    }
    if (field === 'type' && value === 'mcq' && !updated[index].options) {
      updated[index].options = ['', '', '', ''];
      updated[index].correctAnswers = [];
    }
    setFormData(prev => ({ ...prev, questions: updated }));
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    if (formData.questions[qIndex].isImported) return;
    const updated = [...formData.questions];
    if (updated[qIndex].options) {
      updated[qIndex].options![optIndex] = value;
      setFormData(prev => ({ ...prev, questions: updated }));
    }
  };

  const toggleCorrectAnswer = (qIndex: number, optIndex: number) => {
    if (formData.questions[qIndex].isImported) return;
    const updated = [...formData.questions];
    const optValue = updated[qIndex].options?.[optIndex] || '';
    const current = updated[qIndex].correctAnswers || [];
    if (current.includes(optValue)) {
      updated[qIndex].correctAnswers = current.filter(a => a !== optValue);
    } else {
      updated[qIndex].correctAnswers = [...current, optValue];
    }
    setFormData(prev => ({ ...prev, questions: updated }));
  };

  const handleQuizConfigChange = (field: keyof QuizConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      quizConfig: { ...prev.quizConfig!, [field]: value }
    }));
  };

  const getExistingImportedQuestionIds = useCallback(() => {
    return formData.questions
      .filter(q => q.isImported && q._id)
      .map(q => q._id as string);
  }, [formData.questions]);

  const QuizConfigSection = () => (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-supperagent" />
        <h3 className="text-sm font-semibold text-gray-900">Quiz Configuration</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-600">Total Marks</Label>
          <Input
            type="number"
            min="0"
            value={formData.quizConfig?.totalMarks}
            onChange={(e) => handleQuizConfigChange('totalMarks', Number(e.target.value))}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-gray-600">Pass Marks</Label>
          <Input
            type="number"
            min="0"
            value={formData.quizConfig?.passMarks}
            onChange={(e) => handleQuizConfigChange('passMarks', Number(e.target.value))}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
      borderRadius: '0.5rem',
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
      '&:hover': { borderColor: '#d1d5db' }
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1f2937'
    })
  };

  const lessonTypeOptions = [
    { value: 'video', label: 'Video Lesson' },
    { value: 'doc', label: 'Text Lesson' },
    { value: 'quiz', label: 'Quiz Assessment' }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Lesson</h1>
          </div>
          <Button onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">Lesson Type</Label>
              <Select
                value={lessonTypeOptions.find(opt => opt.value === lessonType)}
                onChange={(option) => option && setLessonType(option.value as any)}
                options={lessonTypeOptions}
                styles={selectStyles}
                className="text-sm"
                isDisabled={true}
              />
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-sm">
              <div className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Lesson Title</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full border border-gray-200 px-4 py-2.5 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">
                      Duration (minutes)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.duration || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: e.target.value ? Number(e.target.value) : 0
                        })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>

                {lessonType === 'quiz' && <QuizConfigSection />}

                {lessonType === 'video' && (
                  <div className="space-y-4 duration-300 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-900">Video Source</Label>
                      <div className="flex rounded-lg border-2 border-gray-300 bg-gray-200 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoMethod('link');
                            if (videoFile && !isGoogleStorageUrl(videoFile.url)) {
                              handleRemoveVideo();
                            } else if (videoFile && isGoogleStorageUrl(videoFile.url)) {
                              // Keep the video file if it's from Google Storage
                              setFormData((prev) => ({
                                ...prev,
                                videoUrl: videoFile.url
                              }));
                            }
                          }}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${videoMethod === 'link' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          External Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoMethod('upload');
                            // If there's a video file from Google Storage, keep it
                            if (videoFile && isGoogleStorageUrl(videoFile.url)) {
                              setFormData((prev) => ({
                                ...prev,
                                videoUrl: videoFile.url
                              }));
                            } else {
                              setFormData((prev) => ({ ...prev, videoUrl: '' }));
                            }
                          }}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${videoMethod === 'upload' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          Direct Upload
                        </button>
                      </div>
                    </div>
                    {videoMethod === 'link' ? (
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                        <Input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Video Upload Dropzone */}
                        <div
                          onClick={() => videoFileInputRef.current?.click()}
                          className={cn(
                            'group relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all',
                            isVideoUploading
                              ? 'border-blue-500 bg-blue-50'
                              : videoFile
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50/50'
                          )}
                        >
                          {videoPreview ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                              <video
                                src={videoPreview}
                                className="h-full w-full object-contain"
                                controls
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveVideo();
                                }}
                                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {videoFile && (
                                <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                                  {videoFile.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-3 text-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                                <Upload className="h-6 w-6 text-supperagent" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Click to upload video
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  MP4, WebM or Ogg (Max 100MB)
                                </p>
                              </div>
                            </div>
                          )}
                          {isVideoUploading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/90 backdrop-blur-[1px]">
                              <div className="mb-3 h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-supperagent"></div>
                              <p className="text-sm font-medium text-supperagent">
                                Uploading video...
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={videoFileInputRef}
                            className="hidden"
                            onChange={handleVideoUpload}
                            accept="video/*"
                          />
                        </div>
                        {videoUploadError && (
                          <p className="text-sm text-red-500">{videoUploadError}</p>
                        )}
                        {videoFile && (
                          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2">
                            <Video className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {videoFile.name}
                            </span>
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {lessonType === 'doc' && (
                  <div className="space-y-2 duration-300 animate-in fade-in">
                    <label className="text-sm font-semibold text-gray-900">Content</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                      placeholder="Write your lesson content here..."
                      className="h-[300px] pb-12"
                    />
                  </div>
                )}

                {lessonType === 'quiz' && (
                  <div className="space-y-8 duration-300 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Questions Builder</h3>
                      <div className="flex gap-2">
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" /> Import Questions
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button type="button" onClick={addQuestion} size="sm" className="bg-supperagent text-white hover:bg-supperagent">
                          <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {formData.questions.length === 0 && (
                        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                          <HelpCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                          <p className="text-sm text-gray-500">
                            No questions added yet. Click "Add Question" or "Import Questions".
                          </p>
                        </div>
                      )}
                      {formData.questions.map((q, qIndex) => (
                        <QuestionItem
                          key={q.tempId || q._id || `q-${qIndex}`}
                          id={q.tempId || q._id || `q-${qIndex}`}
                          index={qIndex}
                          moveQuestion={moveQuestion}
                          onDelete={() => handleDeleteQuestion(qIndex)}
                          isImported={q.isImported}
                        >
                          {q.isImported && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-supperagent">
                              <Download className="h-3 w-3" />
                              <span className="font-medium">Imported from Question Bank</span>
                              <div className="ml-2 rounded-full bg-supperagent px-2 py-1 text-xs font-medium text-white">
                                Read Only
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-3">
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder="Enter the question text..."
                                className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${q.isImported ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'bg-white'}`}
                                readOnly={q.isImported}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <select
                                value={q.type}
                                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 ${q.isImported ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'bg-white'}`}
                                disabled={q.isImported}
                              >
                                <option value="mcq">MCQ</option>
                                <option value="short">Short Answer</option>
                              </select>
                            </div>
                          </div>
                          {q.type === 'mcq' && (
                            <div className="space-y-2 pl-1">
                              <p className="mb-2 text-xs font-medium text-gray-500">
                                Answer Options {q.isImported && '(Read Only)'}
                              </p>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {q.options?.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <div
                                      onClick={() => !q.isImported && toggleCorrectAnswer(qIndex, optIndex)}
                                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                        q.correctAnswers?.includes(opt)
                                          ? 'border-green-500 bg-green-500 text-white'
                                          : 'border-gray-300 bg-white'
                                      } ${q.isImported ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
                                    >
                                      {q.correctAnswers?.includes(opt) && (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      )}
                                    </div>
                                    <Input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className={`flex-1 rounded-md border px-3 py-1.5 text-sm outline-none ${
                                        q.correctAnswers?.includes(opt) ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                      } ${q.isImported ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'bg-white'}`}
                                      readOnly={q.isImported}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {q.type === 'short' && (
                            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                              <AlertCircle className="mt-0.5 h-5 w-5 text-supperagent" />
                              <div>
                                <p className="text-sm font-medium text-supperagent">Manual Grading Required</p>
                                <p className="mt-1 text-xs text-supperagent">
                                  Short questions do not have a pre-defined answer here. Instructors will score this question manually after submission.
                                  {q.isImported && ' This imported question is read-only.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </QuestionItem>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-xl border-2 border-gray-300 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Lesson Settings</h3>
              <div className="space-y-4">
                {/* Additional Files - Updated with new upload logic */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Additional Resources
                  </label>
                  
                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 mb-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex w-full items-center justify-between rounded-md border border-green-200 bg-green-50 p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-5 w-5 flex-shrink-0 text-green-600" />
                            <p className="truncate text-xs font-medium text-green-700" title={file.name}>
                              {file.name}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                            className="h-8 w-8 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Dropzone */}
                  <div
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                      isUploading
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      disabled={isUploading}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <p className="text-xs text-blue-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Add Documents
                        </span>
                        <span className="text-xs text-gray-400">PDF/Images (Max 20MB each)</span>
                      </div>
                    )}
                  </div>
                  
                  {uploadError && (
                    <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Additional Note</label>
                  <ReactQuill
                    theme="snow"
                    value={additionalNote}
                    onChange={setAdditionalNote}
                    placeholder="Add additional notes for this lesson..."
                    className="h-[200px] pb-20"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Button type="submit" disabled={loading} className="w-full bg-supperagent hover:bg-supperagent/90">
                  {loading ? 'Saving...' : 'Update Lesson'}
                </Button>
              </div>
            </div>
          </div>
        </form>

        <ImportQuestionsDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImportQuestions}
          existingImportedQuestions={getExistingImportedQuestionIds()}
        />
      </div>
    </DndProvider>
  );
}