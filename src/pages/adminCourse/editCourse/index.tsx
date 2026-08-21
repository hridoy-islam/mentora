import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoveLeft, Save, Trash2, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/lib/axios';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface Category {
  _id: string;
  name: string;
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface Option {
  value: string;
  label: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FormState {
  title: string;
  courseOverview: string;
  description: string;
  price: string | number;
  originalPrice: string | number;
  image: string;
}

interface FormErrors {
  title?: string;
  categoryId?: string;
  instructorId?: string;
  price?: string;
  originalPrice?: string;
  description?: string;
  image?: string;
  courseOverview?: string;
}

export default function EditCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState<FormState>({
    title: '',
    courseOverview: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
  });

  const [faq, setFaq] = useState<FaqItem[]>([{ question: '', answer: '' }]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [categories, setCategories] = useState<Option[]>([]);
  const [instructors, setInstructors] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Option | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setInitialLoading(true);

      try {
        const [categoriesRes, instructorsRes, courseRes] = await Promise.all([
          axiosInstance.get('/category?limit=all&status=active'),
          axiosInstance.get('/users?limit=all&role=instructor'),
          axiosInstance.get(`/courses/${id}`),
        ]);

        const categoryOptions = categoriesRes.data.data.result.map((cat: Category) => ({
          value: cat._id,
          label: cat.name,
        }));

        const instructorOptions = instructorsRes.data.data.result.map((inst: Instructor) => ({
          value: inst._id,
          label: `${inst.name} (${inst.email})`,
        }));

        setCategories(categoryOptions);
        setInstructors(instructorOptions);

        const course = courseRes.data.data;

        setFormData({
          title: course.title || '',
          courseOverview: course.courseOverview || '',
          description: course.description || '',
          price: course.price ?? '',
          originalPrice: course.originalPrice ?? '',
          image: course.image || '',
        });

        setImagePreview(course.image || null);
        setLearningPoints(course.learningPoints || []);
        setRequirements(course.requirements || []);
        setFaq(course.faq && course.faq.length > 0 ? course.faq : [{ question: '', answer: '' }]);

        const activeCategory = categoryOptions.find((c: Option) => c.value === course.categoryId);
        const activeInstructor = instructorOptions.find((i: Option) => i.value === course.instructorId);

        setSelectedCategory(activeCategory || null);
        setSelectedInstructor(activeInstructor || null);
      } catch (error) {
        console.error('Error fetching course data', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required.';
      isValid = false;
    }

    if (!formData.courseOverview.trim()) {
      newErrors.courseOverview = 'Course overview is required.';
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.categoryId = 'Please select a category.';
      isValid = false;
    }

    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      newErrors.price = 'Price is required.';
      isValid = false;
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative.';
      isValid = false;
    }

    if (!formData.image) {
      newErrors.image = 'Course banner image is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // --- Image Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setErrors((prev) => ({ ...prev, image: undefined }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('entityId', id || '');
      formDataUpload.append('file_type', 'courseImage');
      formDataUpload.append('file', file);

      const response = await axiosInstance.post('/documents', formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / (progressEvent.total || 100)) * 100
          );
          setUploadProgress(percent);
        },
      });

      if (response.data?.success && response.data.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, image: response.data.data.fileUrl }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading the image. Try again.');
      setImagePreview(formData.image);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  // --- Form Handlers ---
  const handleInputChange = (field: keyof FormState, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFaq((prev) => {
      const newFaq = [...prev];
      newFaq[index] = { ...newFaq[index], [field]: value };
      return newFaq;
    });
  };

  const addFaq = () => setFaq([...faq, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaq(faq.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice !== '' ? Number(formData.originalPrice) : undefined,
        categoryId: selectedCategory?.value,
        instructorId: selectedInstructor?.value,
        learningPoints: learningPoints.filter((lp) => lp.trim() !== ''),
        requirements: requirements.filter((req) => req.trim() !== ''),
        faq: faq.filter((f) => f.question.trim() !== '' || f.answer.trim() !== ''),
      };

      await axiosInstance.patch(`/courses/${id}`, payload);
      navigate(-1);
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLearningPoint = () => setLearningPoints([...learningPoints, '']);
  const updateLearningPoint = (i: number, v: string) => {
    const newPoints = [...learningPoints];
    newPoints[i] = v;
    setLearningPoints(newPoints);
  };
  const removeLearningPoint = (i: number) => {
    setLearningPoints(learningPoints.filter((_, idx) => idx !== i));
  };

  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (i: number, v: string) => {
    const newReq = [...requirements];
    newReq[i] = v;
    setRequirements(newReq);
  };
  const removeRequirement = (i: number) => {
    setRequirements(requirements.filter((_, idx) => idx !== i));
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
  ];

  if (initialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          <MoveLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title & Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={errors.title ? 'text-red-500' : ''}>
                  Course Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Mastering React"
                  className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label className={errors.categoryId ? 'text-red-500' : ''}>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setErrors((prev) => ({ ...prev, categoryId: undefined }));
                  }}
                  placeholder="Select category"
                  classNames={{
                    control: () =>
                      `text-sm border ${
                        errors.categoryId ? 'border-red-500' : 'border-input'
                      } hover:border-ring shadow-sm rounded-md`,
                    placeholder: () => 'text-muted-foreground',
                  }}
                />
                {errors.categoryId && (
                  <p className="text-xs text-red-500 font-medium">{errors.categoryId}</p>
                )}
              </div>
            </div>

            {/* Course Overview */}
            <div className="space-y-2">
              <Label className={errors.courseOverview ? 'text-red-500' : ''}>
                Course Overview <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.courseOverview}
                onChange={(e) => handleInputChange('courseOverview', e.target.value)}
                placeholder="Brief high-level overview of the course..."
                rows={3}
                className={errors.courseOverview ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.courseOverview && (
                <p className="text-xs text-red-500 font-medium">{errors.courseOverview}</p>
              )}
            </div>

            {/* Price, Original Price & Instructor */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className={errors.price ? 'text-red-500' : ''}>
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="99.99"
                  className={errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Original Price <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  placeholder="149.99"
                />
              </div>

              <div className="space-y-2">
                <Label className={errors.instructorId ? 'text-red-500' : ''}>Instructor</Label>
                <Select
                  options={instructors}
                  value={selectedInstructor}
                  onChange={(val) => {
                    setSelectedInstructor(val);
                    setErrors((prev) => ({ ...prev, instructorId: undefined }));
                  }}
                  placeholder="Select instructor"
                  classNames={{
                    control: () =>
                      `text-sm border ${
                        errors.instructorId ? 'border-red-500' : 'border-input'
                      } hover:border-ring shadow-sm rounded-md`,
                    placeholder: () => 'text-muted-foreground',
                  }}
                />
                {errors.instructorId && (
                  <p className="text-xs text-red-500 font-medium">{errors.instructorId}</p>
                )}
              </div>
            </div>

            {/* Course Banner Image */}
            <div className="space-y-2">
              <Label className={`mb-2 block ${errors.image ? 'text-red-500' : ''}`}>
                Course Banner Image <span className="text-red-500">*</span>
              </Label>
              <div
                onClick={triggerFileInput}
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all md:w-[400px] ${
                  errors.image
                    ? 'border-red-500 bg-red-50'
                    : imagePreview
                    ? 'border-transparent'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin text-supperagent mb-2" />
                    <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={imagePreview}
                      alt="Course Preview"
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="h-8 w-8 shadow-sm transition-opacity"
                        title="Remove Image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                    <div
                      className={`p-3 rounded-full mb-3 ${
                        errors.image ? 'bg-red-100' : 'bg-gray-100'
                      }`}
                    >
                      <ImageIcon
                        className={`w-6 h-6 ${errors.image ? 'text-red-500' : 'text-gray-400'}`}
                      />
                    </div>
                    <p className={`mb-1 text-sm font-semibold ${errors.image ? 'text-red-500' : ''}`}>
                      Click to upload course image
                    </p>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              {errors.image && <p className="text-xs text-red-500 font-medium">{errors.image}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className={errors.description ? 'text-red-500' : ''}>About This Course</Label>
              <div className={errors.description ? 'border border-red-500 rounded-md' : ''}>
                <ReactQuill
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Write a detailed course description..."
                  className="h-[250px] pb-10"
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
              {errors.description && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.description}</p>
              )}
            </div>

            {/* Learning Outcomes */}
            <div>
              <Label className="mb-1 block text-lg font-medium">What you'll learn</Label>
              <p className="mb-3 text-sm text-gray-500">
                What will students be able to do after completing this course?
              </p>

              <div className="space-y-3">
                {learningPoints.map((point, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={point}
                      onChange={(e) => updateLearningPoint(index, e.target.value)}
                      placeholder={`Learning outcome ${index + 1}`}
                      className="border border-gray-300 bg-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeLearningPoint(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-dashed"
                onClick={addLearningPoint}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Outcome
              </Button>
            </div>

            {/* Requirements */}
            <div>
              <Label className="mb-1 block text-lg font-medium">Requirements</Label>
              <p className="mb-3 text-sm text-gray-500">
                What knowledge or skills should students have before starting?
              </p>

              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Prerequisite ${index + 1}`}
                      className="border border-gray-300 bg-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-dashed"
                onClick={addRequirement}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Requirement
              </Button>
            </div>

            {/* FAQs */}
            <div>
              <Label className="mb-1 block text-lg font-medium">Frequently Asked Questions</Label>
              <p className="mb-3 text-sm text-gray-500">
                Add common questions and answers about the course
              </p>

              <div className="space-y-4">
                {faq.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50/50"
                  >
                    <div className="grid gap-3 flex-1 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Question {index + 1}</Label>
                        <Input
                          value={item.question}
                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                          placeholder="What is this course about?"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Answer {index + 1}</Label>
                        <Input
                          value={item.answer}
                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                          placeholder="This course will teach you..."
                          className="bg-white"
                        />
                      </div>
                    </div>
                    {faq.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFaq(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-5 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-dashed"
                onClick={addFaq}
              >
                <Plus className="mr-1 h-4 w-4" /> Add FAQ
              </Button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Course
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}