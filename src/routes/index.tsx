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
import { ContactPage } from '@/pages/auth/contactPage';
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
          path: 'profile',
          element: <ProfilePage />
        }
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

  const routes = useRoutes([...publicRoutes, ...adminRoutes]);

  return routes;
}
