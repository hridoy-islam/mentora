import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useRouter } from '@/routes/hooks';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Timer } from 'lucide-react';

// --- UI Components ---
import { Badge } from '@/components/ui/badge';
// --- End UI Components ---

// --- Redux Imports ---
import {
  resendOtp,
  validateRequestOtp,
  resetError
} from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
// --- End Redux Imports ---

export default function OtpPage() {
  // --- State and Refs ---
  const [otp, setOtp] = useState(Array(4).fill(''));
  const { loading, error: reduxError } = useSelector(
    (state: any) => state.auth
  );
  const [localError, setLocalError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // --- End State and Refs ---

  // --- Hooks ---
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const navigate = useNavigate();
  const email = localStorage.getItem('tp_otp_email');
  const { user } = useSelector((state: any) => state.auth);

  // --- Effects ---
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
    dispatch(resetError());
  }, [email, router, dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      setIsCooldownActive(false);
    }
    return () => clearTimeout(timer);
  }, [isCooldownActive, resendCooldown]);

  // --- Event Handlers ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const index = inputRefs.current.indexOf(target);

    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setOtp((prevOtp) => {
        const updatedOtp = [...prevOtp];
        updatedOtp[index] = '';
        return updatedOtp;
      });

      if (e.key === 'Backspace' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1)
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split('');
    setOtp(digits);
    inputRefs.current[otp.length - 1]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(resetError());

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setLocalError('Please enter all 4 digits.');
      return;
    }
    if (!email) {
      router.push('/forgot-password');
      return;
    }

    try {
      const result: any = await dispatch(
        validateRequestOtp({ email, otp: otpCode })
      );

      if (result?.payload?.success) {
        const decoded = jwtDecode(result?.payload?.data?.resetToken);
        localStorage.setItem(
          'tp_user_data',
          JSON.stringify({
            ...decoded,
            token: result?.payload?.data?.resetToken
          })
        );
        router.push('/new-password');
      } else {
        const backendMessage =
          result?.payload?.message ||
          result?.payload?.errorSources?.[0]?.message ||
          'Invalid OTP. Please try again.';
        setLocalError(backendMessage);
      }
    } catch (error: any) {
      setLocalError(
        error?.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      router.push('/forgot-password');
      return;
    }
    try {
      await dispatch(resendOtp({ email }));
      setResendCooldown(30);
      setIsCooldownActive(true);
      setLocalError('');
      dispatch(resetError());
    } catch (err) {
      setLocalError('Failed to resend OTP. Please try again.');
    }
  };

  const displayError = localError || reduxError;

  return (
    <div className="flex w-full min-h-screen bg-white overflow-hidden ">
      
      {/* Left Column - Brand & Visuals */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-8 text-white bg-gradient-to-tr from-supperagent to-supperagent/70 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/auth.png"
            alt="OTP Illustration"
            className="w-full max-w-sm mx-auto drop-shadow-2xl mb-8 rounded-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-3">Verification</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Security is our priority. Verify your identity to proceed.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a 4-digit code to <span className="font-semibold text-gray-900">{email}</span>.
            </p>
          </div>

          <form
            id="otp-form"
            onSubmit={handleOtpSubmit}
            onPaste={handlePaste}
            className="space-y-6"
          >
            <div className="flex justify-between gap-3 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1}"
                  maxLength={1}
                  value={digit}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  ref={(el) => (inputRefs.current[index] = el)}
                  disabled={loading}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-semibold shadow-sm outline-none transition-all focus:border-supperagent focus:ring-1 focus:ring-supperagent disabled:opacity-50"
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={otp.some((digit) => digit === '') || loading}
              className="w-full h-10 bg-supperagent text-white font-semibold text-sm rounded-lg shadow-md hover:bg-supperagent/90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify Code'}
            </motion.button>
          </form>

          {displayError && (
            <Badge
              variant="outline"
              className="mt-4 w-full justify-center border-red-200 bg-red-50 py-2 text-red-600"
            >
              {displayError}
            </Badge>
          )}

          {/* Resend and Back Links */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center text-sm">
              <span className="text-gray-500 mr-2">Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isCooldownActive}
                className={`font-semibold inline-flex items-center gap-1 transition-colors ${
                  isCooldownActive
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-supperagent hover:text-mentora hover:underline'
                }`}
              >
                {isCooldownActive && <Timer className="w-3 h-3" />}
                {isCooldownActive
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-supperagent transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}