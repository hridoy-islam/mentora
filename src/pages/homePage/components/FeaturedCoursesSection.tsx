import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/shared/MedicareLoader';

const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/courses?limit=4');
      const result = response.data.data?.result || response.data.data || [];
      
      // FIX 2: actually update the state!
      setCourses(result); 
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* --- Background Texture --- */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* --- Ambient Blobs --- */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6">
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-supperagent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-supperagent">
            <HeartPulse className="h-3.5 w-3.5" />
            Top Rated Training
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-mentora md:text-5xl">
            Master Essential{' '}
            <span className="bg-gradient-to-r from-supperagent to-teal-600 bg-clip-text text-transparent">
              Care Skills
            </span>
          </h2>
          <p className="text-lg text-gray-500">
            Explore our most popular CPD accredited courses, designed by medical
            professionals to advance your career.
          </p>
        </motion.div>

        {/* --- Course Grid --- */}
        {loading ? (
           <><Loader/></>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <CourseCard
                  key={course._id || index}
                  course={course}
                  index={index} // Pass index for animation stagger
                  onClick={() => navigate(`/courses/${course?.slug}`)}
                />
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500">
                No courses found.
              </div>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Button
            onClick={() => navigate(`/courses`)}
            size="lg"
            className="h-12 rounded-full border border-gray-200 bg-white px-8 font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-supperagent hover:shadow-md"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View All Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;