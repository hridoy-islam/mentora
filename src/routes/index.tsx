import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import NotFound from '@/pages/not-found';
import ProfilePage from '@/pages/profile';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/auth/new-password';
import AdminLayout from '@/components/layout/admin-layout';
import PublicLayout from '@/components/layout/public-layout';
import HomePage from '@/pages/homePage';
import  CoursePage  from '@/pages/coursePage';
import CourseDetailPage from '@/pages/coursePage/courseDetails';
import { ContactPage } from '@/pages/contactPage';
import { CartPage } from '@/pages/cartPage';
import StudentLayout from '@/components/layout/student-layout';
import { StudentDashboard } from '@/pages/dashboard/rolewise-dashboard/student-dashboard';
import { CourseDetails } from '@/pages/enrollCourse/courseDetail';
import { MyCourses } from '@/pages/myCourse';
import CoursesPage from '@/pages/adminCourse';
import AdminCoursesPage from '@/pages/adminCourse';
import CreateCoursePage from '@/pages/adminCourse/createCourse';
import CourseModulesPage from '@/pages/courseModule';
import LessonsPage from '@/pages/courseLesson';
import CreateLessonPage from '@/pages/courseLesson/createLesson';
import EditLessonPage from '@/pages/courseLesson/editLesson';
import CategoryPage from '@/pages/categoryPage';
import EditCoursePage from '@/pages/adminCourse/editCourse';
import StudentPage from '@/pages/userManagement/studentPage';
import OrganizationPage from '@/pages/userManagement/orgnizationPage';
import InstructorPage from '@/pages/userManagement/InstructorPage';
import QuestionBankPage from '@/pages/questionPage';
import PreviewCourseDetails from '@/pages/previewCourseWebsite';
import OrganizationStaffPage from '@/pages/userManagement/orgnizationPage/staffPage';
import { PreviewStudentCourseDetailsPage } from '@/pages/previewCourseStudent';
import PreviewLayout from '@/components/layout/preview-layout';
import MyStaffPage from '@/pages/my-staff';
import OrganizationCoursesPage from '@/pages/organizationCourse';
import AboutPage from '@/pages/aboutPage';
import StaffEnrollCoursePage from '@/pages/userManagement/orgnizationPage/staffPage/staffEnrollCourse';
import ReportPage from '@/pages/reportPage';
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const adminRoutes = [
    {
      path: '/dashboard',
      element: (
        <AdminLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </AdminLayout>
      ),
      children: [
        {
          element: <DashboardPage />,
          index: true
        },
         {
          path: 'categories',
          element: <CategoryPage />
        },
        {
          path: 'courses',
          element: <AdminCoursesPage />
        },
        {
          path: 'courses/create',
          element: <CreateCoursePage />
        },
         {
          path: 'courses/edit/:id',
          element: <EditCoursePage />
        },
         {
          path: 'courses/:cid/course-modules',
          element: <CourseModulesPage />
        },
        {
          path: 'courses/:cid/course-modules/:mid/lessons',
          element: <LessonsPage />
        },
         {
          path: 'courses/:cid/course-modules/:mid/lessons/create',
          element: <CreateLessonPage />
        },
         {
          path: 'courses/:cid/course-modules/:mid/lessons/edit/:id',
          element: <EditLessonPage />
        },
        
         {
          path: 'students',
          element: <StudentPage />
        },
         {
          path: 'organizations',
          element: <OrganizationPage />
        },
         {
          path: 'organizations/:id/staffs',
          element: <OrganizationStaffPage />
        },
         {
          path: 'organizations/:id/staffs/:sid/enroll-courses',
          element: <StaffEnrollCoursePage />
        },
         {
          path: 'instructors',
          element: <InstructorPage />
        },
        {
          path: 'questions',
          element: <QuestionBankPage />
        },
        {
          path: 'my-staff',
          element: <MyStaffPage />
        },
        {
          path: 'company/courses',
          element: <OrganizationCoursesPage />
        },
        {
          path: 'report',
          element: <ReportPage />
        },
      ]
    }
  ];

    const PreviewRoutes = [
    {
      path: '/dashboard',
      element: (
        <PreviewLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </PreviewLayout>
      ),
      children: [
         {
          path: 'courses/:cid/website-preview',
          element: <PreviewCourseDetails />
        },
         {
          path: 'courses/:cid/student-preview',
          element: <PreviewStudentCourseDetailsPage />
        },
      ]
    }
  ];


   const StudentRoutes = [
    {
      path: '/student',
      element: (
        <StudentLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </StudentLayout>
      ),
      children: [
        {
          element: <StudentDashboard />,
          index: true
        },
        {
          path: 'courses',
          element: <CoursePage />
        },
         {
          path: 'my-courses',
          element: <MyCourses />
        },
         {
          path: 'courses/:id',
          element: <CourseDetails />
        },
         {
          path: 'contact',
          element: <ContactPage />
        },
        {
          path: 'cart',
          element: <CartPage />,
          index: true
        },
      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/',
      element: (
        <PublicLayout>
          <Outlet />
        </PublicLayout>
      ),
      children: [
        {
          element: <HomePage />,
          index: true
        },
        {
          path: '/contact',
          element: <ContactPage />,
          index: true
        },
        {
          path: '/about-us',
          element: <AboutPage />,
          index: true
        },
        {
          path: '/courses',
          element: <CoursePage />,
          index: true
        },
        
         {
          path: '/courses/:id',
          element: <CourseDetailPage />,
          index: true
        },
        {
          path: '/login',
          element: <SignInPage />,
          index: true
        },
        {
          path: 'cart',
          element: <CartPage />,
          index: true
        },
        {
          path: '/signup',
          element: <SignUpPage />,
          index: true
        },
        {
          path: '/forgot-password',
          element: <ForgotPassword />,
          index: true
        },
        {
          path: '/otp',
          element: <Otp />,
          index: true
        },
        {
          path: '/new-password',
          element: <NewPassword />,
          index: true
        },
        {
          path: '/404',
          element: <NotFound />
        },

        {
          path: '*',
          element: <Navigate to="/404" replace />
        }
      ]
    }
  ];

  const routes = useRoutes([...StudentRoutes,...publicRoutes, ...adminRoutes,...PreviewRoutes]);

  return routes;
}
