import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Pen,
  Trash2,
  MoveLeft,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2
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
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';

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
    options: ['', '', '', ''],
    correctAnswers: [] as string[],
    shortAnswer: ''
  });

  // Track format for EACH option individually
  const [optionTypes, setOptionTypes] = useState<string[]>(['text', 'text', 'text', 'text']);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const questionTypeOptions = [
    { value: 'mcq', label: 'MCQ' },
    { value: 'short', label: 'Short Answer' }
  ];

  const optionFormatOptions = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' }
  ];

  const fetchQuestions = async (page: number, limit: number, search: string = '') => {
    try {
      const response = await axiosInstance.get('/questions', {
        params: { page, limit, ...(search ? { searchTerm: search } : {}) }
      });
      setQuestions(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch questions', variant: 'destructive' });
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
        options: question.options?.length ? question.options : [''],
        correctAnswers: question.correctAnswers || [],
        shortAnswer: question.shortAnswer || '',
      });
      
      // Infer optionTypes from backend if provided, otherwise check if URL
      if (question.optionType && Array.isArray(question.optionType)) {
        setOptionTypes(question.optionType);
      } else {
        setOptionTypes(
          (question.options || ['']).map((opt: string) => 
            opt.match(/^https?:\/\//) ? 'image' : 'text'
          )
        );
      }
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        type: 'mcq',
        options: ['', '', '', ''],
        correctAnswers: [],
        shortAnswer: ''
      });
      setOptionTypes(['text', 'text', 'text', 'text']);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        question: formData.question,
        type: formData.type,
        options: formData.type === 'mcq' ? formData.options : undefined,
        correctAnswers: formData.type === 'mcq' ? formData.correctAnswers : undefined,
        // FIX: Mapping the array to 'optionType' to match the Mongoose schema requirement
        optionType: formData.type === 'mcq' ? optionTypes : undefined, 
        shortAnswer: formData.type === 'short' ? formData.shortAnswer : undefined
      };

      if (editingQuestion) {
        await axiosInstance.patch(`/questions/${editingQuestion._id}`, payload);
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestion._id ? { ...q, ...payload } : q))
        );
        toast({ title: 'Question updated successfully' });
      } else {
        const response = await axiosInstance.post('/questions', payload);
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

  const confirmDelete = async () => {
    if (!deleteQuestionId) return;
    try {
      await axiosInstance.delete(`/questions/${deleteQuestionId}`);
      setQuestions((prev) => prev.filter((q) => q._id !== deleteQuestionId));
      toast({ title: 'Question deleted successfully' });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Failed to delete question', variant: 'destructive' });
    }
  };

  const updateOption = (optIndex: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[optIndex] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const changeOptionFormat = (optIndex: number, format: string) => {
    const newTypes = [...optionTypes];
    newTypes[optIndex] = format;
    setOptionTypes(newTypes);
    updateOption(optIndex, ''); // Clear value when format changes
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
    setOptionTypes([...optionTypes, 'text']);
  };

  const removeOption = (optIndex: number) => {
    if (formData.options.length <= 1) return;
    const newOptions = formData.options.filter((_, i) => i !== optIndex);
    const newTypes = optionTypes.filter((_, i) => i !== optIndex);
    const newCorrect = formData.correctAnswers.filter(
      (ans) => formData.options[optIndex] !== ans
    );
    setFormData({ ...formData, options: newOptions, correctAnswers: newCorrect });
    setOptionTypes(newTypes);
  };

  const toggleCorrectAnswer = (optIndex: number) => {
    const option = formData.options[optIndex];
    if (!option.trim()) return;

    const currentCorrect = formData.correctAnswers;
    let newCorrect;
    if (currentCorrect.includes(option)) {
      newCorrect = currentCorrect.filter((ans) => ans !== option);
    } else {
      newCorrect = [...currentCorrect, option];
    }
    setFormData({ ...formData, correctAnswers: newCorrect });
  };

  const triggerFileInput = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploadingIndex === null) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File must be less than 5MB.', variant: 'destructive' });
      setUploadingIndex(null);
      return;
    }

    const uploadData = new FormData();
    if (user?._id) uploadData.append('entityId', user._id);
    uploadData.append('file_type', 'questionOption');
    uploadData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) throw new Error('No file URL returned');

      updateOption(uploadingIndex, fileUrl);
    } catch (err) {
      toast({ title: 'Failed to upload image.', variant: 'destructive' });
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions(1, entriesPerPage, searchTerm);
  };

  if (loading) return <div className="flex justify-center py-6"><BlinkingDots size="large" color="bg-supperagent" /></div>;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-4">
            <CardTitle>Questions List</CardTitle>
            <div className="flex items-center space-x-4">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by question"
                className="h-8 min-w-[300px]"
              />
              <Button onClick={handleSearch} size="sm" className="min-w-[100px] bg-supperagent text-white">Search</Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="bg-supperagent text-white" onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
            <Button size="default" onClick={() => navigate(-1)} variant="outline"><MoveLeft className="mr-2 h-4 w-4" /> Back</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Question</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="py-6 text-center">No questions found</TableCell></TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q._id}>
                    <TableCell>{q.question}</TableCell>
                    <TableCell><Badge className="text-xs">{q.type.toUpperCase()}</Badge></TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(q)} className="bg-supperagent text-white"><Pen className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => { setDeleteQuestionId(q._id); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {questions.length > 40 && (
            <div className="mt-4"><DataTablePagination pageSize={entriesPerPage} setPageSize={setEntriesPerPage} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl space-y-4">
          <DialogHeader><DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle></DialogHeader>

          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">Question Type</Label>
            <Select
              className="w-1/2"
              value={questionTypeOptions.find((o) => o.value === formData.type)}
              onChange={(val) => setFormData({ ...formData, type: val?.value || 'mcq', options: val?.value === 'mcq' ? ['', '', '', ''] : [] })}
              isDisabled={!!editingQuestion}
              options={questionTypeOptions}
            />
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">Question</Label>
            <Input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question text..."
            />
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {formData.type === 'mcq' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Answer Options <span className="text-gray-500">(Mark the correct option)</span>
                </label>
                <Button type="button" onClick={addOption} size="sm" variant="outline" className="text-xs">
                  <Plus className="mr-1 h-3 w-3" /> Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {formData.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3 w-full">
                    
                    {/* 1. Correct Answer Checkbox */}
                    <div
                      onClick={() => toggleCorrectAnswer(optIndex)}
                      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                        formData.correctAnswers.includes(opt)
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {formData.correctAnswers.includes(opt) && <CheckCircle2 className="h-5 w-5" />}
                    </div>

                    {/* 2. Option Input (Text or Image) */}
                    <div className="flex-1">
                      {optionTypes[optIndex] === 'text' ? (
                        <Input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className={`h-11 ${formData.correctAnswers.includes(opt) ? 'border-green-300 bg-green-50' : ''}`}
                        />
                      ) : (
                        <div
                          onClick={() => triggerFileInput(optIndex)}
                          // FIX: Removed the green background for uploaded images. Only the checkbox dictates green now.
                          className={`flex h-11 cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-4 transition-all ${
                            uploadingIndex === optIndex ? 'border-blue-300 bg-blue-50' : opt ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {uploadingIndex === optIndex ? (
                            <div className="flex items-center text-blue-600">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="text-sm">Uploading...</span>
                            </div>
                          ) : opt ? (
                            <div className="flex items-center justify-between w-full">
                              <img src={opt} alt={`Option ${optIndex + 1}`} className="h-8 w-12 object-cover rounded border" />
                              <span className="text-xs text-gray-500">Click to replace</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <ImageIcon className="mr-2 h-4 w-4" />
                              <span className="text-sm">Upload Image</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Option Format Select (Beside Delete Button) */}
                    <div className="w-32 shrink-0">
                      <Select
                        value={optionFormatOptions.find((o) => o.value === optionTypes[optIndex])}
                        onChange={(val) => changeOptionFormat(optIndex, val?.value || 'text')}
                        options={optionFormatOptions}
                        styles={{ control: (base) => ({ ...base, minHeight: '44px' }) }}
                      />
                    </div>

                    {/* 4. Delete Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeOption(optIndex)}
                      disabled={formData.options.length <= 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.type === 'short' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-supperagent" />
                <div>
                  <p className="text-sm font-medium text-supperagent">Manual Grading Required</p>
                  <p className="mt-1 text-xs text-supperagent">Short questions will be scored manually after submission.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-supperagent text-white" onClick={handleSubmit}>
              {editingQuestion ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure you want to delete this question?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}