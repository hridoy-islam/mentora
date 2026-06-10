import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  FileQuestion,
  XCircle,
  Trophy,
  BookOpen,
  Eye,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';

// --- Types ---
interface QuestionOption {
  _id?: string;
  question: string;
  type: string;
  options: string[];
  optionType?: string[];
  correctAnswers?: string[];
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
  importedQuestions?: QuestionOption[];
  quizConfig?: {
    totalMarks: number;
    passMarks: number;
  };
}

interface CourseModule {
  _id: string;
  title: string;
  index?: number;
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

interface EvaluatedAnswer {
  questionId: string;
  providedAnswer: string[];
  correctAnswers?: string[];
  isCorrect: boolean;
  marksAwarded: number;
}

interface QuizResult {
  totalScore: number;
  isPassed: boolean;
  answers: EvaluatedAnswer[];
}

// --- Quiz Step Types ---
type QuizStep = 'ready' | 'confirm' | 'in_progress' | 'result';

// ─────────────────────────────────────────────────────────────────────────────
// QuizRenderer — fully self-contained multi-step quiz component
// ─────────────────────────────────────────────────────────────────────────────
interface QuizRendererProps {
  lesson: LessonData;
  course: CourseMetadata;
  user: any;
  enrolledCourseId: string | null;
  alreadyCompleted: boolean;
  existingResult: QuizResult | null;
  onQuizPassed: () => void;
  isAdmin: boolean;
}

function QuizRenderer({
  lesson,
  course,
  user,
  enrolledCourseId,
  alreadyCompleted,
  existingResult,
  onQuizPassed,
  isAdmin,
}: QuizRendererProps) {
  const allQuestions: QuestionOption[] = useMemo(
    () => [...(lesson.questions || []), ...(lesson.importedQuestions || [])],
    [lesson]
  );

  const [step, setStep] = useState<QuizStep>(
    alreadyCompleted && existingResult ? 'result' : 'ready'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(existingResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);

  useEffect(() => {
    setStep(alreadyCompleted && existingResult ? 'result' : 'ready');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(existingResult);
    setShowAnswerDialog(false);
  }, [lesson._id]);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const progressPercent =
    allQuestions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / allQuestions.length) * 100)
      : 0;

  const handleOptionToggle = (opt: string) => {
    if (step !== 'in_progress') return;
    setSelectedAnswers((prev) => {
      const current = prev[currentQuestionIndex] || [];
      const updated = current.includes(opt)
        ? current.filter((a) => a !== opt)
        : [...current, opt];
      return { ...prev, [currentQuestionIndex]: updated };
    });
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) setCurrentQuestionIndex((i) => i + 1);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1);
  };

 const handleSubmitQuiz = async () => {
  const unansweredCount = allQuestions.filter(
    (_, idx) => !selectedAnswers[idx] || selectedAnswers[idx].length === 0
  ).length;

  if (unansweredCount > 0) {
    alert(`Please answer all questions. ${unansweredCount} question(s) remaining.`);
    return;
  }

  // ── Admin: evaluate locally, no API call ─────────────────────────────────
  if (isAdmin) {
    let totalScore = 0;
    const answers: EvaluatedAnswer[] = allQuestions.map((q, idx) => {
      const provided = selectedAnswers[idx] || [];
      const correct = q.correctAnswers || [];
      const isCorrect =
        provided.length === correct.length &&
        provided.every((a) => correct.includes(a));
      const marksAwarded = isCorrect ? 1 : 0;
      if (isCorrect) totalScore++;
      return {
        questionId: q._id ?? String(idx),
        providedAnswer: provided,
        correctAnswers: correct,
        isCorrect,
        marksAwarded,
      };
    });

    const passMarks = lesson.quizConfig?.passMarks ?? Math.ceil(allQuestions.length * 0.5);
    const result: QuizResult = {
      totalScore,
      isPassed: totalScore >= passMarks,
      answers,
    };
    setQuizResult(result);
    setStep('result');
    return; // done — no onQuizPassed, no PATCH
  }

  // ── Student: submit to backend ────────────────────────────────────────────
  const answersPayload = allQuestions.map((q, idx) => ({
    questionId: q._id,
    providedAnswer: selectedAnswers[idx] || [],
  }));

  setIsSubmitting(true);
  try {
    const res = await axiosInstance.post('/quiz-submission', {
      courseId: course._id,
      lessonId: lesson._id,
      answers: answersPayload,
      studentId: user._id,
    });
    const data = res.data.data;
    const result: QuizResult = {
      totalScore: data.totalScore,
      isPassed: data.isPassed,
      answers: (data.answers || []).map((a: any) => ({
        questionId: a.questionId,
        providedAnswer: a.providedAnswer || [],
        correctAnswers: a.correctAnswers || [],
        isCorrect: a.isCorrect,
        marksAwarded: a.marksAwarded,
      })),
    };
    setQuizResult(result);
    setStep('result');
    if (result.isPassed) {
      onQuizPassed();
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Failed to submit quiz. Please try again.';
    alert(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  // ── READY screen ──────────────────────────────────────────────────────────
  if (step === 'ready') {
    return (
      <>
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-10 py-16 text-center text-white">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-supperagent/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-supperagent/20 ring-1 ring-supperagent/30 shadow-lg shadow-supperagent/20">
              <ClipboardList className="h-10 w-10 text-supperagent" />
            </div>

            <h2 className="mb-2 text-3xl font-bold tracking-tight">{lesson.title}</h2>
            <p className="mb-8 text-slate-400">Test your knowledge • {allQuestions.length} Questions</p>

            {/* Show warning only to students */}
            {!isAdmin && (
              <div className="mb-6 mx-auto max-w-md rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-left">
                <p className="text-sm font-semibold text-amber-300 mb-1">⚠ Before you start</p>
                <ul className="space-y-1 text-xs text-amber-200/80 list-disc list-inside">
                  <li>You can only attempt this quiz once — no retakes.</li>
                  <li>Answer every question before submitting.</li>
                </ul>
              </div>
            )}

            {/* Admin preview badge */}
            {isAdmin && (
              <div className="mb-6 mx-auto max-w-md rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-left">
                <p className="text-sm font-semibold text-blue-300 mb-1">👁 Admin Preview Mode</p>
                <ul className="space-y-1 text-xs text-blue-200/80 list-disc list-inside">
                  <li>You are previewing this quiz as an admin.</li>
                  <li>Submissions will not affect any student records.</li>
                </ul>
              </div>
            )}

            <Button
              size="lg"
              onClick={() => setShowConfirmStart(true)}
              className="min-w-[200px] bg-supperagent text-white font-semibold shadow-lg shadow-supperagent/30 hover:bg-supperagent/90 transition-all duration-200"
            >
              <Play className="mr-2 h-4 w-4 fill-white" />
              {isAdmin ? 'Preview Quiz' : 'Start Quiz'}
            </Button>
          </div>
        </Card>

        <Dialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-supperagent" />
                {isAdmin ? 'Preview Quiz?' : 'Ready to Begin?'}
              </DialogTitle>
              <DialogDescription className="pt-1">
                {isAdmin
                  ? `You are previewing this quiz as an admin. Your answers won't be saved. The quiz has ${allQuestions.length} question(s).`
                  : `Once you start, the quiz timer begins. You cannot retake this quiz after submitting. Make sure you have enough time to complete all `}
                {!isAdmin && <strong>{allQuestions.length} questions</strong>}
                {!isAdmin && '.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setShowConfirmStart(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmStart(false);
                  setStep('in_progress');
                }}
                className="w-full bg-supperagent text-white hover:bg-supperagent/90 sm:w-auto"
              >
                {isAdmin ? 'Start Preview' : 'Yes, Start Quiz'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── IN PROGRESS screen ───────────────────────────────────────────────────
  if (step === 'in_progress' && currentQuestion) {
    const currentSelected = selectedAnswers[currentQuestionIndex] || [];
    const isCurrentAnswered = currentSelected.length > 0;
    const answeredCount = allQuestions.filter(
      (_, idx) => selectedAnswers[idx] && selectedAnswers[idx].length > 0
    ).length;

    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 bg-white px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-supperagent/10 text-supperagent">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAdmin ? 'Quiz Preview' : 'Quiz in Progress'}
                </p>
                <h2 className="text-sm font-bold text-slate-800">{lesson.title}</h2>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              {answeredCount} / {allQuestions.length} Answered
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-1.5 flex justify-between text-[11px] font-medium text-slate-400">
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
            <span>{progressPercent}% complete</span>
          </div>
        </div>

        <CardContent className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-supperagent text-xs font-bold text-white">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Select All That Apply'}
              </span>
            </div>
            <h3 className="text-xl font-semibold leading-snug text-slate-900">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((opt, optIndex) => {
              const isSelected = currentSelected.includes(opt);
              const isImage = currentQuestion.optionType && currentQuestion.optionType[optIndex] === 'image';

              return (
                <div
                  key={`${currentQuestion._id}-${optIndex}`}
                  onClick={() => handleOptionToggle(opt)}
                  className={`
                    group relative flex cursor-pointer select-none items-center gap-4 rounded-xl border-2 p-4
                    transition-all duration-150 ease-in-out
                    ${isSelected
                      ? 'border-supperagent bg-supperagent/5 shadow-md ring-1 ring-supperagent/10'
                      : 'border-slate-200 hover:border-supperagent/40 hover:bg-slate-50'}
                  `}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors
                      ${isSelected ? 'border-supperagent bg-supperagent' : 'border-slate-300'}`}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className={`flex-1 text-sm font-medium ${isSelected ? 'text-supperagent' : 'text-slate-700'}`}>
                    {isImage ? (
                      <img src={opt} alt={`Option ${optIndex + 1}`} className="max-h-40 rounded-md object-contain border border-slate-200 bg-white" />
                    ) : (
                      <span>{opt}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex gap-1">
              {allQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    idx === currentQuestionIndex
                      ? 'w-4 bg-supperagent'
                      : selectedAnswers[idx]?.length > 0
                        ? 'bg-green-400'
                        : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || !isCurrentAnswered}
                className="gap-2 bg-supperagent text-white hover:bg-supperagent/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : isAdmin ? 'Finish Preview' : 'Finish & Submit'}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="gap-2 bg-supperagent text-white hover:bg-supperagent/90"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── RESULT screen ─────────────────────────────────────────────────────────
  if (step === 'result' && quizResult) {
    const scorePercent = allQuestions.length > 0
      ? Math.round((quizResult.totalScore / allQuestions.length) * 100)
      : 0;

    return (
      <>
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div
            className={`relative px-10 py-14 text-center text-white ${
              quizResult.isPassed
                ? 'bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900'
                : 'bg-gradient-to-br from-slate-900 via-red-950 to-slate-900'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl ${quizResult.isPassed ? 'bg-emerald-400/20' : 'bg-red-500/10'}`} />
              <div className={`absolute -left-16 bottom-0 h-64 w-64 rounded-full blur-3xl ${quizResult.isPassed ? 'bg-teal-300/10' : 'bg-rose-500/10'}`} />
            </div>

            <div className="relative">
              <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ring-4 ${
                quizResult.isPassed
                  ? 'bg-emerald-500/20 ring-emerald-400/30'
                  : 'bg-red-500/20 ring-red-400/30'
              }`}>
                {quizResult.isPassed
                  ? <Trophy className="h-12 w-12 text-amber-400" />
                  : <XCircle className="h-12 w-12 text-red-400" />
                }
              </div>

              <h2 className="mb-1 text-3xl font-bold tracking-tight">
                {quizResult.isPassed ? 'Congratulations!' : 'Keep Pushing!'}
              </h2>
              <p className={`mb-8 text-lg ${quizResult.isPassed ? 'text-emerald-200' : 'text-red-300'}`}>
                {quizResult.isPassed ? 'Quiz passed!' : 'Did not meet pass mark.'}
              </p>

              <div className="mx-auto mb-8 grid max-w-xs grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-2xl font-bold">{quizResult.totalScore}</p>
                  <p className="mt-0.5 text-xs text-white/60">Score</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-2xl font-bold">{allQuestions.length}</p>
                  <p className="mt-0.5 text-xs text-white/60">Total</p>
                </div>
              </div>

              <div className="mx-auto max-w-sm">
                <div className="mb-1.5 flex justify-between text-xs text-white/60">
                  <span>0%</span>
                  <span className="font-semibold text-white/80">Your score: {scorePercent}%</span>
                  <span>100%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${quizResult.isPassed ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 bg-white p-8 sm:flex-row sm:justify-center">
            {isAdmin ? (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
                <Eye className="h-4 w-4" />
                Admin preview — no progress recorded.
              </div>
            ) : quizResult.isPassed ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Quiz completed. Your progress has been updated.
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                <XCircle className="h-4 w-4" />
                You did not pass. This quiz cannot be retaken.
              </div>
            )}

            <Button
              onClick={() => setShowAnswerDialog(true)}
              className="gap-2 !h-11 !rounded-md border-slate-300 hover:border-supperagent"
            >
              <Eye className="h-4 w-4" />
              Review Answers
            </Button>
          </div>
        </Card>

        {/* Answer Review Dialog */}
        <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
            <DialogHeader className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-supperagent" />
                Answer Review
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                {lesson.title} • Scored {quizResult.totalScore} / {allQuestions.length} ({scorePercent}%)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-6">
              {allQuestions.map((q, qIndex) => {
                const evaluated = quizResult.answers.find((a) => a.questionId === q._id);
                const givenAnswers = evaluated?.providedAnswer || [];
                const correctAnswers = evaluated?.correctAnswers || q.correctAnswers || [];
                const isCorrect = evaluated?.isCorrect ?? false;
                const marksAwarded = evaluated?.marksAwarded ?? 0;

                return (
                  <div
                    key={q._id || qIndex}
                    className={`rounded-xl border bg-white p-5 shadow-sm ${
                      isCorrect ? 'border-emerald-200' : 'border-red-200'
                    }`}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                          isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h4>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {marksAwarded} / 1 pts
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {q.type === 'mcq' ? 'Multiple Choice' : 'Select All That Apply'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt, oIdx) => {
                        const isGiven = givenAnswers.includes(opt);
                        const isCorrectOpt = correctAnswers.includes(opt);

                        let containerClass = 'border-slate-200 bg-slate-50 text-slate-500';
                        let icon = <div className="h-4 w-4 rounded-full border-2 border-slate-300" />;
                        let label = null;

                        if (isGiven && isCorrectOpt) {
                          containerClass = 'border-emerald-300 bg-emerald-50 text-emerald-900';
                          icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
                          label = (
                            <span className="ml-auto rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              Correct
                            </span>
                          );
                        } else if (isGiven && !isCorrectOpt) {
                          containerClass = 'border-red-300 bg-red-50 text-red-900';
                          icon = <XCircle className="h-4 w-4 text-red-500" />;
                          label = (
                            <span className="ml-auto rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                              Your Answer
                            </span>
                          );
                        } else if (!isGiven && isCorrectOpt) {
                          containerClass = 'border-emerald-200 bg-emerald-50/50 text-emerald-800 border-dashed';
                          icon = <div className="h-4 w-4 rounded-full border-2 border-emerald-400 bg-emerald-100" />;
                          label = (
                            <span className="ml-auto rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              Correct Answer
                            </span>
                          );
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${containerClass}`}
                          >
                            <div className="shrink-0">{icon}</div>
                            <div className="flex-1 font-medium">
                              {q.optionType?.[oIdx] === 'image' ? (
                                <img
                                  src={opt}
                                  alt={`Option ${oIdx + 1}`}
                                  className="max-h-24 rounded-md object-contain border border-slate-200 bg-white"
                                />
                              ) : (
                                <span>{opt}</span>
                              )}
                            </div>
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && correctAnswers.length > 0 && (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Correct Answer{correctAnswers.length > 1 ? 's' : ''} You Missed:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {correctAnswers.map((ans, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {ans}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <Button
                onClick={() => setShowAnswerDialog(false)}
                className="bg-supperagent text-white hover:bg-supperagent/90"
              >
                Close Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function EnrollCourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [lessonQuizResults, setLessonQuizResults] = useState<Record<string, QuizResult>>({});

  const location = useLocation();
  const enrollCourseIdFromState = location.state?.enrollCourseId;

  const completedLessonsRef = useRef<Set<string>>(completedLessons);
  useEffect(() => { completedLessonsRef.current = completedLessons; }, [completedLessons]);

  const completedModulesRef = useRef<Set<string>>(completedModules);
  useEffect(() => { completedModulesRef.current = completedModules; }, [completedModules]);

  useEffect(() => {
    if (enrollCourseIdFromState) {
      localStorage.setItem('currentEnrollCourseId', enrollCourseIdFromState);
    }
  }, [enrollCourseIdFromState]);

  const storedEnrollCourseId = localStorage.getItem('currentEnrollCourseId');

  const { user } = useSelector((state: any) => state.auth);

  // ── Derived admin flag ────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        const courseRes = await axiosInstance.get(`/courses/slug/${slug}`);
        const courseData = courseRes.data.data;
        if (!courseData) { setCourse(null); return; }
        setCourse(courseData);

        const modulesRes = await axiosInstance.get('/course-modules', { params: { courseId: courseData._id } });
        const rawModules: CourseModule[] = modulesRes.data.data.result || [];
        const modules = rawModules.sort((a, b) => (a.index || 0) - (b.index || 0));

        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const lessonsRes = await axiosInstance.get('/course-lesson', { params: { moduleId: mod._id } });
            const rawLessons: LessonData[] = lessonsRes.data.data.result || [];
            const sortedLessons = rawLessons.sort((a, b) => a.index - b.index);
            const totalDuration = sortedLessons.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0);
            return { _id: mod._id, title: mod.title, lessonsList: sortedLessons, totalDurationMinutes: totalDuration };
          })
        );
        setSections(modulesWithLessons);

        // Admins skip enrollment lookup entirely
        if (!isAdmin) {
          const enrollRes = await axiosInstance.get('/enrolled-courses', { params: { courseId: courseData._id } });
          const enrollments = enrollRes.data.data?.result || [enrollRes.data.data];
          const targetEnrollId = storedEnrollCourseId || enrollCourseIdFromState;
          const enrollment = targetEnrollId
            ? enrollments.find((e: any) => e._id === targetEnrollId)
            : enrollments[0];

          const completedLessonIds: string[] = enrollment?.completedLessons?.map((l: any) => l._id || l) || [];
          const completedModuleIds: string[] = enrollment?.completedModules?.map((m: any) => m._id || m) || [];

          if (enrollment) {
            setEnrolledCourseId(enrollment._id);
            setCompletedLessons(new Set(completedLessonIds));
            setCompletedModules(new Set(completedModuleIds));
          }

          // Fetch existing quiz submissions for students only
          try {
            const allLsn = modulesWithLessons.flatMap((m) => m.lessonsList);
            const quizLessons = allLsn.filter((l) => l.type === 'quiz' && completedLessonIds.includes(l._id));
            if (quizLessons.length > 0 && user?._id) {
              const submissionsRes = await axiosInstance.get('/quiz-submission', {
                params: { studentId: user._id, courseId: courseData._id },
              });
              const submissions = submissionsRes.data.data?.result || [];
              const resultMap: Record<string, QuizResult> = {};
              submissions.forEach((sub: any) => {
                resultMap[sub.lessonId] = {
                  totalScore: sub.totalScore,
                  isPassed: sub.isPassed,
                  answers: (sub.answers || []).map((a: any) => ({
                    questionId: a.questionId,
                    providedAnswer: a.providedAnswer || [],
                    correctAnswers: a.correctAnswers || [],
                    isCorrect: a.isCorrect,
                    marksAwarded: a.marksAwarded,
                  })),
                };
              });
              setLessonQuizResults(resultMap);
            }
          } catch (_) {
            // Non-critical
          }
        }

        if (modulesWithLessons.length > 0) {
          const firstModule = modulesWithLessons[0];
          setExpandedModules(new Set([firstModule._id]));

          if (isAdmin) {
            // Admin always starts at the very first lesson, nothing locked
            setCurrentLesson(firstModule.lessonsList[0] ?? null);
          } else {
            const allLsn = modulesWithLessons.flatMap((m) => m.lessonsList);
            const completedIds = new Set(
              (await axiosInstance.get('/enrolled-courses', { params: { courseId: courseData._id } })
                .then((r) => {
                  const enrollments = r.data.data?.result || [r.data.data];
                  const targetEnrollId = storedEnrollCourseId || enrollCourseIdFromState;
                  const enrollment = targetEnrollId
                    ? enrollments.find((e: any) => e._id === targetEnrollId)
                    : enrollments[0];
                  return enrollment?.completedLessons?.map((l: any) => l._id || l) || [];
                })
                .catch(() => []))
            );
            const firstUncompleted = allLsn.find((l) => !completedIds.has(l._id));
            if (firstUncompleted) {
              setCurrentLesson(firstUncompleted);
              setExpandedModules(new Set([firstUncompleted.moduleId]));
            } else if (firstModule.lessonsList.length > 0) {
              setCurrentLesson(firstModule.lessonsList[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, storedEnrollCourseId, enrollCourseIdFromState, isAdmin]);

  useEffect(() => {
    return () => { localStorage.removeItem('currentEnrollCourseId'); };
  }, []);

  const allLessons = useMemo(() => sections.flatMap((s) => s.lessonsList), [sections]);

  const currentIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return allLessons.findIndex((l) => l._id === currentLesson._id);
  }, [currentLesson, allLessons]);

  // Admin: everything unlocked; Student: sequential unlock logic
  const isLessonUnlocked = (lessonId: string) => {
    if (isAdmin) return true;
    const index = allLessons.findIndex((l) => l._id === lessonId);
    if (index === 0) return true;
    if (completedLessons.has(lessonId)) return true;
    const prev = allLessons[index - 1];
    if (prev && completedLessons.has(prev._id)) return true;
    return false;
  };

  // Admin: skip PATCH entirely; Student: update progress as before
  const markAsCompleted = async (lessonToComplete: LessonData) => {
    if (isAdmin) return; // No-op for admin
    if (!enrolledCourseId) return;

    const curr = completedLessonsRef.current;
    const currMods = completedModulesRef.current;

    const newLessons = new Set(curr);
    newLessons.add(lessonToComplete._id);

    const newMods = new Set(currMods);
    const mod = sections.find((s) => s._id === lessonToComplete.moduleId);
    if (mod && mod.lessonsList.every((l) => newLessons.has(l._id))) {
      newMods.add(mod._id);
    }

    const progress = Math.round((newLessons.size / allLessons.length) * 100);

    try {
      await axiosInstance.patch(`/enrolled-courses/${enrolledCourseId}`, {
        completedLessons: Array.from(newLessons),
        completedModules: Array.from(newMods),
        progress,
      });
      if (!curr.has(lessonToComplete._id)) {
        setCompletedLessons(newLessons);
        setCompletedModules(newMods);
        completedLessonsRef.current = newLessons;
        completedModulesRef.current = newMods;
      }
    } catch (err) {
      console.error('Failed to update course progress', err);
    }
  };

  const currentModule = useMemo(() => {
    if (!currentLesson) return null;
    return sections.find((s) => s._id === currentLesson.moduleId);
  }, [sections, currentLesson]);

  const moduleStats = useMemo(() => {
    if (!currentModule) return { total: 0, completed: 0, percentage: 0 };
    const total = currentModule.lessonsList.length;
    const completed = currentModule.lessonsList.filter((l) => completedLessons.has(l._id)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [currentModule, completedLessons]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const lq = searchQuery.toLowerCase();
    return sections
      .map((s) => ({ ...s, lessonsList: s.lessonsList.filter((l) => l?.title?.toLowerCase()?.includes(lq)) }))
      .filter((s) => s.lessonsList.length > 0);
  }, [sections, searchQuery]);

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

  const handleLessonClick = (lesson: LessonData, forceBypass = false) => {
    if (isAdmin || forceBypass || isLessonUnlocked(lesson._id)) {
      if (!expandedModules.has(lesson.moduleId)) {
        setExpandedModules((prev) => new Set(prev).add(lesson.moduleId));
      }
      setCurrentLesson(lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = async () => {
    if (!currentLesson) return;

    if (!isAdmin) {
      // Students must complete quiz before proceeding
      if (currentLesson.type === 'quiz' && !completedLessons.has(currentLesson._id)) {
        alert('Please complete the quiz before moving to the next lesson.');
        return;
      }
      // Mark non-quiz lessons as completed for students
      if (currentLesson.type !== 'quiz') {
        await markAsCompleted(currentLesson);
      }
    }

    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      handleLessonClick(allLessons[currentIndex + 1], true);
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      // Admin can always go back; students check unlock
      if (isAdmin || isLessonUnlocked(prev._id)) handleLessonClick(prev);
    }
  };

  const formatDuration = (totalMinutes: number) => {
    if (!totalMinutes) return '0 min';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `${h} hr ${m > 0 ? `${m} min` : ''}`;
    return `${m} min`;
  };

  const toggleModule = (moduleId: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
    setExpandedModules(next);
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const isNextDisabled = () => {
    if (isAdmin) return currentIndex === allLessons.length - 1; // Admin: only disable on very last lesson
    if (!currentLesson) return true;
    if (currentLesson.type === 'quiz' && !completedLessons.has(currentLesson._id)) return true;
    if (currentIndex === allLessons.length - 1 && completedLessons.has(currentLesson._id)) return true;
    return false;
  };

  // ── Content Renderer ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (!currentLesson)
      return <div className="p-10 text-center text-slate-500">Select a lesson to begin</div>;

    if (currentLesson.type === 'video') {
      return (
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl border-none bg-black shadow-xl ring-1 ring-slate-900/5">
            <div className="relative aspect-video w-full">
              {currentLesson.videoUrl ? (
                <iframe
                  width="100%" height="100%"
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
          <div className="px-1 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{currentLesson.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                Video Lesson • {currentLesson.duration} minutes
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'doc') {
      return (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-start">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">{currentLesson.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-4 w-4" />
                  <span>Reading Material • {currentLesson.duration} min read</span>
                </div>
              </div>
            </div>
            <div
              className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-a:text-blue-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>No content available.</p>' }}
            />
          </CardContent>
        </Card>
      );
    }

    if (currentLesson.type === 'quiz' && course) {
      const alreadyCompleted = completedLessons.has(currentLesson._id);
      const existingResult = lessonQuizResults[currentLesson._id] || null;

      return (
        <QuizRenderer
          key={currentLesson._id}
          lesson={currentLesson}
          course={course}
          user={user}
          enrolledCourseId={enrolledCourseId}
          alreadyCompleted={alreadyCompleted}
          existingResult={existingResult}
          onQuizPassed={() => markAsCompleted(currentLesson)}
          isAdmin={isAdmin}
        />
      );
    }
  };

  if (loading) return (
    <div className="container mx-auto space-y-6 py-8">
      <Skeleton className="h-8 w-1/3 rounded-md" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Skeleton className="h-[500px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="rounded-full bg-red-50 p-4"><AlertCircle className="h-10 w-10 text-red-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800">Oops! Something went wrong</h2>
      <p className="text-slate-500">{error}</p>
      <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
    </div>
  );

  if (!course) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="rounded-full bg-slate-200 p-4"><FileQuestion className="h-10 w-10 text-slate-500" /></div>
      <h2 className="text-2xl font-bold text-slate-800">No Course Data Available</h2>
      <p className="text-slate-500">We couldn't find the course you are looking for.</p>
      <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost" size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full text-slate-500 hover:bg-supperagent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div>
              <h1 className="line-clamp-1 max-w-[200px] text-base font-bold text-slate-800 sm:max-w-md">
                {course?.title}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                {isAdmin
                  ? `Admin Preview${currentLesson?.title ? ` — ${currentLesson.title}` : ''}`
                  : currentLesson?.title ? `Current: ${currentLesson.title}` : 'Course Overview'
                }
              </p>
            </div>
          </div>

          {/* Admin badge in header */}
          {isAdmin && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
              <Eye className="h-3 w-3 mr-1" />
              Admin Preview
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Content */}
          <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-8">
            {renderContent()}

            {/* Navigation Buttons */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6">
              <Button
                onClick={handlePrevLesson}
                disabled={currentIndex <= 0}
                className="gap-2 rounded-full bg-supperagent px-6 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Lesson
              </Button>

              <Button
                onClick={handleNextLesson}
                disabled={isNextDisabled()}
                className="gap-2 rounded-full bg-supperagent px-6 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {currentIndex === allLessons.length - 1
                  ? <><span>{isAdmin ? 'Last Lesson' : 'Complete'}</span> <CheckCircle2 className="h-4 w-4" /></>
                  : <><span>Next Lesson</span> <ChevronRight className="h-4 w-4" /></>
                }
              </Button>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="order-1 h-fit lg:order-2 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {/* Header */}
                <div className="relative bg-slate-900 p-6 text-white">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-supperagent/20 blur-3xl" />
                  <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-supperagent/10 blur-3xl" />
                  <div className="relative z-10">
                    <div className="mb-4 flex flex-row items-end justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isAdmin ? 'Admin Preview' : 'Current Progress'}
                        </span>
                        <h3 className="line-clamp-1 text-base font-bold tracking-wide text-white">
                          {currentModule ? currentModule.title : ''}
                        </h3>
                      </div>
                      {/* Hide progress counter for admin since it's not meaningful */}
                      {!isAdmin && (
                        <div className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1">
                          <span className="text-xs font-bold text-supperagent">{moduleStats.completed}</span>
                          <span className="text-[10px] text-slate-500">/</span>
                          <span className="text-xs font-bold text-slate-400">{moduleStats.total}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress bar: only meaningful for students */}
                    {!isAdmin && (
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="absolute h-full rounded-full bg-supperagent shadow-[0_0_15px_currentColor] text-supperagent transition-all duration-700 ease-out"
                          style={{ width: `${moduleStats.percentage}%` }}
                        />
                      </div>
                    )}

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

                {/* Lessons List */}
                <div className="custom-scrollbar max-h-[calc(100vh-28rem)] overflow-y-auto bg-slate-50">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => {
                      const isExpanded = expandedModules.has(section._id);
                      const isActiveModule = section.lessonsList.some((l) => l._id === currentLesson?._id);

                      return (
                        <div key={section._id} className="group/module border-b border-slate-200 bg-white last:border-0">
                          <button
                            onClick={() => toggleModule(section._id)}
                            className={`w-full px-5 py-4 text-left transition-colors duration-200 ${isActiveModule ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded transition-colors ${isActiveModule ? 'bg-supperagent/10 text-supperagent' : 'bg-slate-100 text-slate-500'}`}>
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-sm font-bold leading-tight ${isActiveModule ? 'text-black' : 'text-slate-600 group-hover/module:text-slate-900'}`}>
                                  {section.title}
                                </h4>
                                <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold">
                                  <span>{section.lessonsList.length} Lessons</span>
                                  <span className="h-1 w-1 rounded-full bg-black" />
                                  <span>{formatDuration(section.totalDurationMinutes)}</span>
                                </p>
                              </div>
                            </div>
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col bg-slate-50/50 pb-2 pt-1">
                              {section.lessonsList.map((lesson, idx) => {
                                const isActive = currentLesson?._id === lesson._id;
                                // Admin: never locked; Student: sequential unlock
                                const isLocked = !isAdmin && !isLessonUnlocked(lesson._id);
                                const isCompleted = completedLessons.has(lesson._id);

                                return (
                                  <button
                                    key={lesson._id}
                                    onClick={() => handleLessonClick(lesson)}
                                    disabled={isLocked}
                                    className={`relative mx-2 my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200
                                      ${isActive ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-200/50'}
                                      ${isLocked ? 'cursor-not-allowed opacity-60 grayscale' : ''}
                                    `}
                                  >
                                    {isActive && <div className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r bg-supperagent" />}

                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold shadow-sm transition-colors
                                      ${isActive ? 'border-supperagent/30 bg-supperagent/10 text-supperagent' : 'border-slate-200 bg-white text-slate-400'}`}
                                    >
                                      {isCompleted
                                        ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        : isLocked
                                          ? <Lock className="h-3.5 w-3.5" />
                                          : <span>{idx + 1}</span>
                                      }
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className={`truncate text-xs ${isActive ? 'font-bold text-black' : 'font-medium text-slate-600'}`}>
                                        {lesson.title}
                                      </p>
                                      <div className="mt-0.5 flex items-center gap-2 font-bold">
                                        <span className="text-[10px] text-black font-bold">
                                          {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Quiz' : 'Reading'}
                                        </span>
                                        <span className="text-[10px] text-black font-bold">•</span>
                                        <span className="text-[10px] text-black font-bold">{formatDuration(Number(lesson.duration))}</span>
                                      </div>
                                    </div>

                                    {isActive && !isLocked && !isCompleted && <Play className="h-3 w-3 fill-supperagent text-supperagent" />}
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
                      <p className="text-sm font-medium text-slate-500">No lessons found</p>
                      <p className="text-xs text-slate-400">Try searching for something else</p>
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