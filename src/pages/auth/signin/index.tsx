import UserAuthForm from './components/user-auth-form';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="flex w-full min-h-screen bg-white overflow-hidden ">
      {/* Left Column - Brand & Visuals (Fixed width 45%) */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-8 text-white bg-gradient-to-tr from-supperagent to-supperagent/70 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/auth.png"
            alt="Sign In Illustration"
            className="w-full max-w-md mx-auto drop-shadow-2xl mb-8 rounded-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-3">Welcome Back!</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Discover, learn, and thrive with us. Continue your educational adventure today.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Sign In
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          <UserAuthForm />

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Don’t have an account yet?{' '}
            <Link
              to="/signup"
              className="font-semibold text-supperagent hover:text-mentora hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}