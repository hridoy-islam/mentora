import { useEffect, useState } from 'react';
import {
  Plus,
  Pen,
  Trash2,
  MoveLeft,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
// Import React Select components
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Badge } from '@/components/ui/badge';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    type: 'mcq',
    options: [''],
    correctAnswers: [],
    shortAnswer: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  // Define question type options for React Select
  const questionTypeOptions = [
    { value: 'mcq', label: 'MCQ' },
    { value: 'short', label: 'Short Answer' }
  ];

  // Fetch Questions
  const fetchQuestions = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      const response = await axiosInstance.get('/questions', {
        params: {
          page,
          limit,
          ...(search ? { searchTerm: search } : {})
        }
      });
      setQuestions(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleOpenDialog = (question: any = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        type: question.type,
        options: question.options || [''],
        correctAnswers: question.correctAnswers || [],
        shortAnswer: question.shortAnswer || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        type: 'mcq',
        options: ['', '', '', ''], // Initialize with 4 options
        correctAnswers: [],
        shortAnswer: ''
      });
    }
    setDialogOpen(true);
  };

  // Create / Update Question
const handleSubmit = async () => {
  try {
    const payload = {
      question: formData.question,
      type: formData.type,
      options: formData.type === 'mcq' ? formData.options : [],
      correctAnswers: formData.type === 'mcq' ? formData.correctAnswers : [],
      shortAnswer: formData.type === 'short' ? formData.shortAnswer : ''
    };

    if (editingQuestion) {
      const response = await axiosInstance.patch(`/questions/${editingQuestion._id}`, payload);

      // Update in local state
      setQuestions((prev) =>
        prev.map((q) => (q._id === editingQuestion._id ? { ...q, ...payload } : q))
      );

      toast({ title: 'Question updated successfully' });
    } else {
      const response = await axiosInstance.post('/questions', payload);

      // Add to local state
      setQuestions((prev) => [{ ...response.data.data }, ...prev]);
      toast({ title: 'Question added successfully' });
    }

    setDialogOpen(false);
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.response?.data?.message || 'Operation failed',
      variant: 'destructive'
    });
  }
};


  // Delete Confirmation
const confirmDelete = async () => {
  if (!deleteQuestionId) return;

  try {
    await axiosInstance.delete(`/questions/${deleteQuestionId}`);

    // Update local state
    setQuestions((prev) => prev.filter((q) => q._id !== deleteQuestionId));

    toast({ title: 'Question deleted successfully' });
    setDeleteDialogOpen(false);
  } catch (error: any) {
    toast({
      title: `${error?.response?.data?.message || 'Failed to delete question'}`,
      variant: 'destructive'
    });
  }
};


  // Questions Builder Functions (for single question in dialog)
  const updateQuestionText = (value: string) => {
    setFormData({ ...formData, question: value });
  };

  const updateQuestionType = (selectedOption: any) => {
    const newType = selectedOption.value;
    setFormData({
      ...formData,
      type: newType,
      // Initialize options with 4 empty strings when switching to MCQ
      options: newType === 'mcq' ? ['', '', '', ''] : formData.options
    });
  };

  const updateOption = (optIndex: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[optIndex] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (optIndex: number) => {
    if (formData.options.length <= 1) return;
    const newOptions = formData.options.filter((_, i) => i !== optIndex);
    const newCorrect = formData.correctAnswers.filter(
      (ans) => formData.options[optIndex] !== ans
    );
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswers: newCorrect
    });
  };

  const toggleCorrectAnswer = (optIndex: number) => {
    const option = formData.options[optIndex];
    if (!option.trim()) return; // Prevent empty options from being selected

    const currentCorrect = formData.correctAnswers;
    let newCorrect;
    if (currentCorrect.includes(option)) {
      newCorrect = currentCorrect.filter((ans) => ans !== option);
    } else {
      newCorrect = [...currentCorrect, option];
    }
    setFormData({ ...formData, correctAnswers: newCorrect });
  };

  const updateShortAnswer = (value: string) => {
    setFormData({ ...formData, shortAnswer: value });
  };
  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions(1, entriesPerPage, searchTerm);
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Question Bank</h1>
          <div className="flex items-center space-x-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by question"
              className="h-8 min-w-[300px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="min-w-[100px] border-none bg-supperagent text-white hover:bg-supperagent/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-supperagent text-white hover:bg-supperagent/90"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center">
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q._id}>
                    <TableCell>{q.question}</TableCell>
                    <TableCell className='text-xs'><Badge className='text-xs'>{q.type.toUpperCase()}</Badge></TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(q)}
                        className="bg-supperagent text-white hover:bg-supperagent/90"
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setDeleteQuestionId(q._id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {questions.length > 40 && (
            <div className="mt-4">
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
          </DialogHeader>

          {/* Question Type Selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Question Type
            </label>
            <Select
              value={questionTypeOptions.find(
                (option) => option.value === formData.type
              )}
              onChange={updateQuestionType}
                isDisabled={!!editingQuestion}
              options={questionTypeOptions}
            />
          </div>

          {/* Question Text Input */}
          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">
              Question
            </Label>
            <Input
              type="text"
              value={formData.question}
              onChange={(e) => updateQuestionText(e.target.value)}
              placeholder="Enter the question text..."
            />
          </div>

          {/* MCQ Options UI */}
          {formData.type === 'mcq' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Answer Options{' '}
                  <span className="text-gray-500">
                    (Mark the correct option)
                  </span>
                </label>

                <Button
                  type="button"
                  onClick={addOption}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {formData.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <div
                      onClick={() => toggleCorrectAnswer(optIndex)}
                      className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors ${formData.correctAnswers.includes(opt) ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                    >
                      {formData.correctAnswers.includes(opt) && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <Input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className={`flex-1 rounded-md border px-3 py-1.5 text-sm outline-none ${formData.correctAnswers.includes(opt) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optIndex)}
                      disabled={formData.options.length <= 1}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Short Answer UI */}
          {formData.type === 'short' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-supperagent" />
                <div>
                  <p className="text-sm font-medium text-supperagent">
                    Manual Grading Required
                  </p>
                  <p className="mt-1 text-xs text-supperagent">
                    Short questions do not have a pre-defined answer here.
                    Instructors will score this question manually after
                    submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-supperagent text-white hover:bg-supperagent/90"
              onClick={handleSubmit}
            >
              {editingQuestion ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this question?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
