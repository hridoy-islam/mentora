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
    <div className="flex container mx-auto py-16">
  {/* Left Column - Image */}
  <div className="relative hidden lg:flex w-full lg:w-1/2 items-center justify-center overflow-hidden">
    <img
      src="/auth.png"
      alt="Sign In Illustration"
      className="z-10 w-full  rounded-lg -mt-28"
    />
  </div>

  {/* Right Column - Form */}
  <div className="flex w-full lg:w-1/2 items-center justify-center">
    <div className="w-full max-w-xl ">
      {/* Header Text */}
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Create an Account!
      </h1>
      <p className="mb-4 text-gray-600">
        Join our community to discover, learn, and thrive. Let's get you set up!
      </p>

      {/* Auth Form Component */}
      <SignUpForm />

      {/* OR Separator */}
      <div className="mt-6 flex items-center justify-center">
        <span className="w-full border-t border-gray-300"></span>
        <span className="mx-4 flex-shrink-0 text-sm uppercase text-gray-500">
          OR
        </span>
        <span className="w-full border-t border-gray-300"></span>
      </div>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-supperagent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}
