import UserAuthForm from './components/user-auth-form';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
     if (user?.role) {
    if (user.role === 'student') navigate('/student');
    else if (['admin', 'instructor', 'company'].includes(user.role)) navigate('/dashboard');
  }
  }, [user, navigate]);

  return (
<div className="flex container mx-auto py-16">
  {/* Left Column - Image */}
  <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center   relative overflow-hidden">
    <img
      src="/auth.png"
      alt="Sign In Illustration"
      className="w-full z-10 rounded-lg"
    />
  </div>

  {/* Right Column - Form */}
  <div className="w-full lg:w-1/2 flex items-center justify-center ">
    <div className="w-full max-w-md">
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
        Don’t have an account yet?{' '}
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