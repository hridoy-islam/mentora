import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoveLeft, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: '',
    aboutDescription: '',
    image: ''
  });

  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [instructors, setInstructors] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Option | null>(
    null
  );
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
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('entityId', '');
      formDataUpload.append('file_type', 'courseImage');
      formDataUpload.append('file', file);

      const response = await axiosInstance.post('/documents', formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
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
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedInstructor) return;
    setLoading(true);

    try {
      const data = {
        ...formData,
        categoryId: selectedCategory.value,
        instructorId: selectedInstructor.value,
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
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link'
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
              <div>
                <Label>Course Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Mastering React"
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select category"
                  required
                />
              </div>
            </div>

            {/* Price & Original Price */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="99.99"
                />
              </div>
              <div>
                <Label>Original Price</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  placeholder="149.99"
                />
              </div>
              <div>
                <Label>Instructor</Label>
                <Select
                  options={instructors}
                  value={selectedInstructor}
                  onChange={setSelectedInstructor}
                  placeholder="Select instructor"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Course Banner Image</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg  border  border-gray-300 p-4 hover:border-supperagent md:max-w-[400px]"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-[300px] rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex flex-col  items-center text-gray-500">
                    <Upload className="mb-2 h-8 w-8" />
                    Click to upload
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div>{uploadProgress}%</div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Description */}
            <div>
              <Label>About This Course</Label>
              <ReactQuill
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Write a detailed course description..."
                className="mt-2 h-[250px] pb-8"
                modules={quillModules}
                formats={quillFormats}
              />
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
                      className="border border-gray-300 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={() => removeLearningPoint(index)}
                      className="h-9 w-9 p-0"
                    >
                      <span className="sr-only">Remove</span>×
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-3"
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
                What knowledge or skills should students have before starting
                this course?
              </p>

              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Prerequisite ${index + 1}`}
                      className="border border-gray-300 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="h-9 w-9 p-0"
                    >
                      <span className="sr-only">Remove</span>×
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-3"
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
              <Button type="submit" disabled={loading} variant="default">
                {loading ? (
                  'Creating...'
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
