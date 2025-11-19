import React, { useState } from 'react'; // Removed useRef
import {
  ArrowLeft,
  Star,
  Clock,
  Download,
  Award,
  BarChart3,
  Share2,
  Heart,
  Zap
} from 'lucide-react'; // Removed ChevronDown, PlayCircle
import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '@/lib/demoData';
import { useDispatch } from 'react-redux'; // <-- Import Redux hook
import { addToCart } from '@/redux/features/cartSlice';
import CourseContentAccordion from '../components/CourseContentAccordion';
import { useToast } from '@/components/ui/use-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // <-- Setup dispatch
  const course = courses.find((c) => c.id === parseInt(id));
const {toast} = useToast()
  const [isWishlisted, setIsWishlisted] = useState(false);

  // All accordion logic (openSections, sectionRefs, toggleSection) is now removed
  // and lives inside CourseContentAccordion

  if (!course)
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Course not found
      </div>
    );

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      id: course.id,
      title: course.title,
      price: course.price,
      image: course.image,
      quantity: 1 // Add one item
    };
    dispatch(addToCart(itemToAdd));
    toast({
    title: "Added to Cart",
    description: `"${course.title}" has been added to your cart.`,
  });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Back Button */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 text-white">
        <div className="container mx-auto px-4">
          <button
            onClick={handleBackToCourses}
            className="mb-6 flex items-center gap-2 font-medium text-slate-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </button>
          <h1 className="text-4xl font-bold lg:text-5xl">{course.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{course.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-12 lg:col-span-2">
            {/* Course Image */}
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img
                src={course.image || '/placeholder.svg'}
                alt={course.title}
                className="h-80 w-full object-cover"
              />
            </div>

            {/* Rating & Instructor */}
            <div className="border-b border-gray-200 pb-8">
              {/* ... (no changes in this block) ... */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(course.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">
                  {course.rating} Rating
                </span>
                <span className="text-gray-600">
                  ({course.reviews} reviews)
                </span>
                <span className="text-gray-600">
                  • {course.students} students
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
                  {course.instructor
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {course.instructor}
                  </div>
                  <div className="text-gray-600">{course.instructorTitle}</div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>⭐ {course.instructorRating} Rating</span>
                    <span>
                      👥 {course.instructorStudents.toLocaleString()} Students
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What you'll learn */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {course.learningPoints.map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Zap size={14} className="text-supperagent" />
                    </div>
                    <span className="font-medium text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Requirements
              </h2>
              <ul className="space-y-3">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="font-bold text-supperagent">•</span>
                    <span className="font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* About This Course */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                About This Course
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-gray-700">
                {course.aboutDescription}
              </p>
            </div>

            {/* === COURSE CONTENT SECTION (NOW A SEPARATE COMPONENT) === */}
            <CourseContentAccordion sections={course.sections} />
            {/* === END OF UPDATED SECTION === */}

            {/* Instructor Details */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                About the Instructor
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-xl font-bold text-white">
                  {course.instructor
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {course.instructor}
                  </h3>
                  <p className="mb-2 text-gray-700">{course.instructorTitle}</p>
                  <p className="leading-relaxed text-gray-700">
                    {course.instructorBio}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Student Reviews
              </h2>
              <div className="space-y-6">
                {course.reviews > 0 && (
                  <>
                    {/* Review 1 */}
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-red-500 font-bold text-white">
                          SJ
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              Sarah Johnson
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">
                            This course is absolutely amazing! The instructor
                            breaks down complex concepts in a very simple and
                            understandable way.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 font-bold text-white">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              John Doe
                            </span>
                            <div className="flex">
                              {[...Array(4)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                              ))}
                              {/* This adds the 5th, empty star */}
                              <Star size={14} className="text-gray-300" />
                            </div>
                          </div>
                          <p className="text-gray-700">
                            Great course! Very comprehensive and
                            well-structured. I learned a lot and would highly
                            recommend for beginners and intermediates alike.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Sidebar */}
          <div className="sticky top-8 self-start lg:col-span-1">
  {/* Course Card */}
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">    
    <div className="space-y-5 p-6">
      {/* Price Info */}
      <div className="border-b border-gray-100 pb-4">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            ${course.price}
          </span>
          <span className="text-base text-gray-500 line-through">
            ${course.originalPrice}
          </span>
        </div>
        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-supperagent">
          Save ${(course.originalPrice - course.price).toFixed(2)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          className="w-full rounded-md bg-supperagent py-3 text-base font-medium text-white transition hover:bg-supperagent focus:outline-none focus:ring-2 focus:ring-supperagent focus:ring-offset-2"
        >
          Add to Cart
        </button>
        
        <button className="w-full rounded-md border border-gray-300 bg-white py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-supperagent focus:ring-offset-2">
          Buy Now
        </button>
      </div>

      {/* Course Details */}
      <div className="space-y-4 border-t border-gray-100 pt-5 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
            <Clock size={14} className="text-supperagent" />
          </div>
          <span className="font-medium text-gray-700">
            {course.duration} hours on demand
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
            <Download size={14} className="text-supperagent" />
          </div>
          <span className="font-medium text-gray-700">
            {course.resources} downloadable resources
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
            <Award size={14} className="text-supperagent" />
          </div>
          <span className="font-medium text-gray-700">
            Certificate of completion
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
            <BarChart3 size={14} className="text-supperagent" />
          </div>
          <span className="font-medium text-gray-700">
            Access on mobile and TV
          </span>
        </div>
      </div>

      {/* Share/Wishlist Buttons */}
      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-supperagent focus:ring-offset-2">
          <Share2 size={16} />
          <span>Share</span>
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-supperagent focus:ring-offset-2"
        >
          <Heart
            size={16}
            fill={isWishlisted ? 'currentColor' : 'none'}
            className={isWishlisted ? 'text-red-500' : ''}
          />
          <span>Wishlist</span>
        </button>
      </div>
    </div>
  </div>

  {/* More Courses by Instructor */}
  <div className="mt-8">
    <h3 className="mb-4 text-lg font-semibold text-gray-900">
      More by {course.instructor}
    </h3>
    <div className="space-y-3">
      {courses
        .filter(
          (c) =>
            c.instructor === course.instructor && c.id !== course.id
        )
        .slice(0, 3)
        .map((c) => (
          <div
            key={c.id}
            className="flex cursor-pointer gap-3 rounded-md border border-gray-200 p-3 transition hover:border-blue-300 hover:shadow-sm"
            onClick={() => navigate(`/courses/${c.id}`)}
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={c.image || '/placeholder.svg'}
                alt={c.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {c.title}
              </h4>
              <div className="mt-1 flex items-center gap-1">
                <Star
                  size={12}
                  className="fill-yellow-400 text-yellow-400"
                />
                <span className="text-xs font-medium text-gray-600">
                  {c.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
