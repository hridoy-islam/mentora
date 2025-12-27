import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mock user data for pre-fill logic
  const prefillData = user || {}; 

  return (
    <div className="flex  w-full bg-slate-50  overflow-hidden">
      {/* Left Column - Brand & Visuals (Fixed width) */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-8 text-white bg-gradient-to-tr from-supperagent to-supperagent/70 relative">
        <div className="relative z-10 max-w-md text-center">
          <motion.img
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            src="/auth.png"
            alt="Sign Up"
            className="w-full max-w-2xl mx-auto drop-shadow-2xl mb-6 "
          />
          <h1 className="text-3xl font-bold mb-2">Welcome to SupperAgent</h1>
          <p className="text-white/80 ">Join the ecosystem where learning meets opportunity.</p>
        </div>
      </div>

      {/* Right Column - Compact Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Create Account
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your details to get started.
            </p>
          </div>

          <SignUpForm user={prefillData} />

          <p className="mt-4 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-supperagent hover:text-mentora hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}