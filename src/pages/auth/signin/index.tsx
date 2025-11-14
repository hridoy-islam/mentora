import UserAuthForm from './components/user-auth-form';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
   <div className="flex w-full">
  {/* Left Column - Fixed Image */}
  <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gray-50 relative overflow-hidden">
    <img
      src="/auth.png"
      alt="Sign In Illustration"
      className="w-full max-w-3xl z-10 rounded-lg fixed top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2"
    />
    <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-100 rounded-full opacity-50"></div>
  </div>

  {/* Right Column - Form */}
  <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
    <div className="max-w-md w-full">
      {/* Header Text */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In!</h1>
      <p className="text-gray-600 mb-8">
        Discover, learn, and thrive with us. Experience a smooth and rewarding
        educational adventure. Let's get started!
      </p>

      {/* Auth Form Component */}
      <UserAuthForm />

      {/* "OR" Separator */}
      <div className="mt-6 flex items-center justify-center">
        <span className="w-full border-t border-gray-300"></span>
        <span className="mx-4 flex-shrink-0 text-gray-500 text-sm uppercase">
          OR
        </span>
        <span className="w-full border-t border-gray-300"></span>
      </div>

      {/* Sign Up Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account yet?{' '}
        <Link
          to="/signup"
          className="font-medium text-purple-600 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}