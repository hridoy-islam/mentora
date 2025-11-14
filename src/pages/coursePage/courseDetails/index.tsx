import React from 'react';
import { ArrowLeft, Star, Clock, Download, Award, BarChart3, Share2, Heart, Zap } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '@/lib/demoData';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === parseInt(id));
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-600">Course not found</div>;

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="">

      {/* Hero Section with Back Button */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 px-4">
        <div className="container mx-auto">
          <button 
            onClick={handleBackToCourses}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </button>
          <h1 className="text-4xl lg:text-5xl font-bold">{course.title}</h1>
          <p className="text-slate-300 mt-4 text-lg">{course.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Image */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={course.image || "/placeholder.svg"} 
                alt={course.title}
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Rating & Instructor */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20}
                      className={i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{course.rating} Rating</span>
                <span className="text-gray-600">({course.reviews} reviews)</span>
                <span className="text-gray-600">• {course.students} students</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-supperagent"></div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">By {course.instructor}</div>
                  <div className="text-gray-600">{course.instructorTitle}</div>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>⭐ {course.instructorRating} Rating</span>
                    <span>👥 {course.instructorStudents.toLocaleString()} Students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What you'll learn */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningPoints.map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <Zap size={14} className="text-supperagent" />
                    </div>
                    <span className="text-gray-700 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Requirements</h2>
              <ul className="space-y-3">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-supperagent font-bold">•</span>
                    <span className="font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* About This Course */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Course</h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                {course.aboutDescription}
              </p>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Content</h2>
              <div className="space-y-3">
                {course.sections.map((section, i) => (
                  <div key={i} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-900">{section.title}</h4>
                      <span className="text-sm text-gray-600 font-medium">{section.lessons} lessons • {section.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Instructor</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.instructorBio}
              </p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Reviews</h2>
              <div className="space-y-6">
                {course.reviews > 0 && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-500"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">Sarah Johnson</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">This course is absolutely amazing! The instructor breaks down complex concepts in a very simple and understandable way.</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">John Doe</span>
                            <div className="flex">
                              {[...Array(4)].map((_, i) => (
                                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">Great course! Very comprehensive and well-structured. I learned a lot and would highly recommend for beginners and intermediates alike.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden sticky top-4 shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-supperagent h-40"></div>
              
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">${course.price}</span>
                    <span className="text-lg text-gray-500 line-through">${course.originalPrice}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">Save ${(course.originalPrice - course.price).toFixed(2)}</span>
                </div>

                <button className="w-full bg-supperagent text-white font-bold py-3 rounded-lg hover:bg-supperagent/90 transition text-lg">
                  Add to Cart
                </button>

                <button className="w-full bg-supperagent/10 text-supperagent font-bold py-3 rounded-lg hover:bg-supperagent/20 transition text-lg">
                  Buy Now
                </button>

                <div className="space-y-3 text-sm border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-supperagent" />
                    <span className="text-gray-700 font-medium">{course.duration} hours on demand</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-supperagent" />
                    <span className="text-gray-700 font-medium">{course.resources} downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-supperagent" />
                    <span className="text-gray-700 font-medium">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-supperagent" />
                    <span className="text-gray-700 font-medium">Access on mobile and TV</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Share2 size={18} />
                  </button>
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>

            {/* More Courses */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 text-lg mb-4">More by {course.instructor}</h3>
              <div className="space-y-4">
                {courses.filter(c => c.instructor === course.instructor && c.id !== course.id).slice(0, 3).map(c => (
                  <div key={c.id} className="flex gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition cursor-pointer" onClick={() => navigate(`/courses/${c.id}`)}>
                    <div className="w-12 h-12 bg-gray-300 rounded flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{c.title}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 font-medium">{c.rating}</span>
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
