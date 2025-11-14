import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';

export default function SignUpPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Redirect if user is already logged in
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
        alt="Sign Up Illustration"
        className="w-full max-w-3xl z-10 rounded-lg fixed top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2"
      />
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-100 rounded-full opacity-50"></div>
    </div>

    {/* Right Column - Form */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
      <div className="w-full">
        {/* Header Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create an Account!
        </h1>
        <p className="text-gray-600 mb-4">
          Join our community to discover, learn, and thrive. Let's get you set up!
        </p>

        {/* Auth Form Component */}
        <SignUpForm />

        {/* "OR" Separator */}
        <div className="mt-6 flex items-center justify-center">
          <span className="w-full border-t border-gray-300"></span>
          <span className="mx-4 flex-shrink-0 text-gray-500 text-sm uppercase">
            OR
          </span>
          <span className="w-full border-t border-gray-300"></span>
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-supperagent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
);

}