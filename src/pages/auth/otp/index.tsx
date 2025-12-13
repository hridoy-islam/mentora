import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useRouter } from '@/routes/hooks';
import { jwtDecode } from 'jwt-decode';

// --- UI Components ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// --- End UI Components ---

// --- Redux Imports ---
import {
  resendOtp,
  validateRequestOtp,
  resetError
} from '@/redux/features/authSlice'; // Added resetError
import { AppDispatch } from '@/redux/store';
// --- End Redux Imports ---

export default function OtpPage() {
  // --- State and Refs ---
  const [otp, setOtp] = useState(Array(4).fill(''));
  // Use Redux error state for consistency
  const { loading, error: reduxError } = useSelector(
    (state: any) => state.auth
  );
  const [localError, setLocalError] = useState(''); // For client-side messages
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
  // --- End Hooks ---

  // --- Effects ---
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
    // Clear Redux errors on mount
    dispatch(resetError());
  }, [email, router, dispatch]);

  // Resend OTP cooldown timer
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
  // --- End Effects ---

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
    // Focus on the last input after paste
    inputRefs.current[otp.length - 1]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(''); // Clear local error
    dispatch(resetError()); // Clear any previous Redux error

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
        // ✅ Properly show backend error
        const backendMessage =
          result?.payload?.message ||
          result?.payload?.errorSources?.[0]?.message ||
          'Invalid OTP. Please try again.';
        setLocalError(backendMessage);
      }
    } catch (error: any) {
      // ✅ Catch unexpected network errors
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
      setLocalError(''); // Clear errors
      dispatch(resetError()); // Clear Redux error
    } catch (err) {
      setLocalError('Failed to resend OTP. Please try again.');
    }
  };
  // --- End Event Handlers ---

  // Combine local and Redux errors for display
  const displayError = localError || reduxError;

  return (
    <div className="container mx-auto flex py-16">
      {/* Left Column - Fixed Image */}
      <div className="relative hidden items-center justify-center overflow-hidden  lg:flex lg:w-1/2">
        <img
          src="/auth.png"
          alt="Sign In Illustration"
          className="z-10  w-full rounded-lg"
        />
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Header Text */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Check your email!
          </h1>
          <p className="mb-8 text-gray-600">
            We've sent a 4-digit code to{' '}
            <strong className="text-gray-800">{email || 'your email'}</strong>.
            Please enter it below.
          </p>

          {/* --- Inlined OTP Form --- */}
          <form
            id="otp-form"
            className="flex justify-between gap-3 sm:gap-4"
            onSubmit={handleOtpSubmit}
            onPaste={handlePaste}
          >
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
                className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-2xl font-medium shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16 sm:w-16"
                disabled={loading}
              />
            ))}
          </form>

          {/* Verify Button */}
          <Button
            disabled={otp.some((digit) => digit === '') || loading}
            onClick={handleOtpSubmit}
            className="mt-6 h-12 w-full bg-supperagent text-base font-semibold hover:bg-supperagent/90 disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          {/* Error Display */}
          {displayError && (
            <Badge
              variant="outline"
              className="mt-4 w-full justify-center border-red-500 py-2 text-red-500"
            >
              {displayError}
            </Badge>
          )}

          {/* Resend OTP */}
          <div className="mt-6 flex items-center justify-center space-x-1 text-sm">
            <span className="text-gray-600">Didn't receive the code?</span>
            <button
              type="button"
              className={`font-medium ${
                isCooldownActive
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-purple-600 hover:underline'
              }`}
              onClick={handleResendOtp}
              disabled={isCooldownActive}
            >
              {isCooldownActive
                ? `Resend in ${resendCooldown}s`
                : 'Resend code'}
            </button>
          </div>

          {/* Back to Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
