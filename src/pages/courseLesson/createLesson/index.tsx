import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MoveLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correctAnswer?: number;
  shortAnswer?: string;
}

export default function CreateLessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const [loading, setLoading] = useState(false);
  const [lessonType, setLessonType] = useState<'video' | 'doc' | 'quiz'>('video');
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    videoUrl: '',
    content: ''
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const payload = {
        moduleId,
        title: formData.title,
        type: lessonType,
        duration: formData.duration,
        ...(lessonType === 'video' && { videoUrl: formData.videoUrl }),
        ...(lessonType === 'doc' && { content: formData.content }),
        ...(lessonType === 'quiz' && { questions: quizQuestions })
      };
      console.log('Creating lesson:', payload);
      navigate(`/course-lesson?moduleId=${moduleId}&courseId=${courseId}`);
    } catch (error) {
      console.error('Error creating lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...quizQuestions];
    if (updated[qIndex].options) {
      updated[qIndex].options![oIndex] = value;
      setQuizQuestions(updated);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
        <Button
          onClick={() =>
            navigate(`/course-lesson?moduleId=${moduleId}&courseId=${courseId}`)
          }
          variant="outline"
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (e.g., 15 min)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="15 min"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Lesson Type</Label>
                <Select
                  value={lessonType}
                  onValueChange={(value: any) => setLessonType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {lessonType === 'video' && (
            <Card>
              <CardHeader>
                <CardTitle>Video Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    required={lessonType === 'video'}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {lessonType === 'doc' && (
            <Card>
              <CardHeader>
                <CardTitle>Document Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter lesson content..."
                    rows={12}
                    required={lessonType === 'doc'}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {lessonType === 'quiz' && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {quizQuestions.map((question, qIndex) => (
                  <Card key={qIndex} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Question {qIndex + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                          disabled={quizQuestions.length === 1}
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <RadioGroup
                          value={question.type}
                          onValueChange={(value: any) =>
                            updateQuestion(qIndex, 'type', value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mcq" id={`mcq-${qIndex}`} />
                            <Label htmlFor={`mcq-${qIndex}`}>
                              Multiple Choice
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="short" id={`short-${qIndex}`} />
                            <Label htmlFor={`short-${qIndex}`}>
                              Short Answer
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'question', e.target.value)
                          }
                          placeholder="Enter your question"
                          rows={2}
                          required
                        />
                      </div>

                      {question.type === 'mcq' && (
                        <>
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {question.options?.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <RadioGroupItem
                                  value={oIndex.toString()}
                                  id={`correct-${qIndex}-${oIndex}`}
                                  checked={question.correctAnswer === oIndex}
                                  onClick={() =>
                                    updateQuestion(qIndex, 'correctAnswer', oIndex)
                                  }
                                />
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(qIndex, oIndex, e.target.value)
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                  required
                                />
                              </div>
                            ))}
                            <p className="text-xs text-gray-500">
                              Select the correct answer by clicking the radio button
                            </p>
                          </div>
                        </>
                      )}

                      {question.type === 'short' && (
                        <div className="space-y-2">
                          <Label>Expected Answer</Label>
                          <Textarea
                            value={question.shortAnswer || ''}
                            onChange={(e) =>
                              updateQuestion(qIndex, 'shortAnswer', e.target.value)
                            }
                            placeholder="Enter the expected answer"
                            rows={2}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(`/course-lesson?moduleId=${moduleId}&courseId=${courseId}`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Lesson
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
