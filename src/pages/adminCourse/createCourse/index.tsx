import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoveLeft, Save, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/lib/axios';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

interface FormErrors {
  title?: string;
  categoryId?: string;
  instructorId?: string;
  price?: string;
  originalPrice?: string;
  description?: string;
  image?: string;
}

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    image: ''
  });

  // Validation State
  const [errors, setErrors] = useState<FormErrors>({});

  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [instructors, setInstructors] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Option | null>(null);
  
  // Image Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, instructorsRes] = await Promise.all([
          axiosInstance.get('/category?limit=all&status=active'),
          axiosInstance.get('/users?limit=all&role=instructor')
        ]);

        setCategories(
          categoriesRes.data.data.result.map((cat: Category) => ({
            value: cat._id,
            label: cat.name
          }))
        );

        setInstructors(
          instructorsRes.data.data.result.map((inst: Instructor) => ({
            value: inst._id,
            label: `${inst.name} (${inst.email})`
          }))
        );
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  // --- Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required.';
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.categoryId = 'Please select a category.';
      isValid = false;
    }

    // if (!selectedInstructor) {
    //   newErrors.instructorId = 'Please select an instructor.';
    //   isValid = false;
    // }

    if (!formData.price) {
      newErrors.price = 'Price is required.';
      isValid = false;
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative.';
      isValid = false;
    }

    // Basic check to see if description is empty or just has empty HTML tags
    const strippedDescription = formData.description.replace(/<[^>]+>/g, '').trim();
    // if (!strippedDescription) {
    //   newErrors.description = 'Course description is required.';
    //   isValid = false;
    // }

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

    // Local Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    // Clear image error if upload starts
    setErrors(prev => ({ ...prev, image: undefined }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('entityId', '');
      formDataUpload.append('file_type', 'courseImage');
      formDataUpload.append('file', file);

      const response = await axiosInstance.post('/documents', formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / (progressEvent.total || 100)) * 100
          );
          setUploadProgress(percent);
        }
      });

      if (response.data?.success && response.data.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, image: response.data.data.fileUrl }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading the image. Try again.');
      setImagePreview(null);
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Ideally scroll to top or first error here
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

   
    
    setLoading(true);

    try {
      const data = {
        ...formData,
        categoryId: selectedCategory?.value,
        instructorId: selectedInstructor?.value,
        learningPoints,
        requirements,
        totalLessons: 0,
        resources: 0,
        rating: 0,
        reviews: 0,
        students: 0
      };

      await axiosInstance.post('/courses', data);
      navigate(-1);
    } catch (error) {
      console.error('Error creating course:', error);
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
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'
  ];

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-3xl font-bold">Create New Course</h1>
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
                <Label className={errors.title ? "text-red-500" : ""}>Course Title <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Mastering React"
                  className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label className={errors.categoryId ? "text-red-500" : ""}>Category <span className="text-red-500">*</span></Label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setErrors(prev => ({ ...prev, categoryId: undefined }));
                  }}
                  placeholder="Select category"
                  classNames={{
                    control: () => `text-sm border ${errors.categoryId ? 'border-red-500' : 'border-input'} hover:border-ring shadow-sm rounded-md`,
                    placeholder: () => "text-muted-foreground"
                  }}
                />
                {errors.categoryId && <p className="text-xs text-red-500 font-medium">{errors.categoryId}</p>}
              </div>
            </div>

            {/* Price & Original Price */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={errors.price ? "text-red-500" : ""}>Price <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="99.99"
                  className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Original Price <span className="text-gray-400 text-xs">(Optional)</span></Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  placeholder="149.99"
                />
              </div>

              <div className="space-y-2">
                <Label className={errors.instructorId ? "text-red-500" : ""}>Instructor </Label>
                <Select
                  options={instructors}
                  value={selectedInstructor}
                  onChange={(val) => {
                    setSelectedInstructor(val);
                    setErrors(prev => ({ ...prev, instructorId: undefined }));
                  }}
                  placeholder="Select instructor"
                  classNames={{
                    control: () => `text-sm border ${errors.instructorId ? 'border-red-500' : 'border-input'} hover:border-ring shadow-sm rounded-md`,
                    placeholder: () => "text-muted-foreground"
                  }}
                />
                 {errors.instructorId && <p className="text-xs text-red-500 font-medium">{errors.instructorId}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className={`mb-2 block ${errors.image ? "text-red-500" : ""}`}>
                Course Banner Image <span className="text-red-500">*</span>
              </Label>
              <div
                onClick={triggerFileInput}
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all md:w-[400px] 
                  ${errors.image ? 'border-red-500 bg-red-50' : imagePreview ? 'border-transparent' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'}
                `}
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
                    <div className={`p-3 rounded-full mb-3 ${errors.image ? 'bg-red-100' : 'bg-gray-100'}`}>
                      <ImageIcon className={`w-6 h-6 ${errors.image ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <p className={`mb-1 text-sm font-semibold ${errors.image ? 'text-red-500' : ''}`}>
                      Click to upload course image
                    </p>
                    <p className="text-xs text-gray-400">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
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
              <Label className={errors.description ? "text-red-500" : ""}>About This Course </Label>
              <div className={errors.description ? "border border-red-500 " : ""}>
                <ReactQuill
                  value={formData.description}
                  onChange={(value) => {
                    handleInputChange('description', value);
                  }}
                  placeholder="Write a detailed course description..."
                  className="h-[250px] pb-10"
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
              {errors.description && <p className="text-xs text-red-500 font-medium mt-1">{errors.description}</p>}
            </div>

            {/* Learning Outcomes */}
            <div>
              <Label className="mb-3 block text-lg font-medium">
                What you'll learn
              </Label>
              <p className="mb-3 text-sm text-gray-500">
                What will students be able to do after completing this course?
              </p>

              <div className="space-y-3">
                {learningPoints.map((point, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={point}
                      onChange={(e) =>
                        updateLearningPoint(index, e.target.value)
                      }
                      placeholder={`Learning outcome ${index + 1}`}
                      className="border border-gray-300 bg-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeLearningPoint(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                + Add Outcome
              </Button>
            </div>

            {/* Requirements */}
            <div>
              <Label className="mb-3 block text-lg font-medium">
                Requirements
              </Label>
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                + Add Requirement
              </Button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Course
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