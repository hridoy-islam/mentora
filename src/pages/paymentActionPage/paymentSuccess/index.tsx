import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

// ─── Types ─────────────────────────────────────────────────────────────────────
type PaymentState = 'verifying' | 'paid' | 'failed' | 'pending' | 'timeout';

// ─── Payment Success Page ──────────────────────────────────────────────────────
// Route: /payment/success?orderId=xxx
// Worldpay redirects here after a successful transaction.
// We poll the backend until the webhook has confirmed payment.
export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const [state, setState] = useState<PaymentState>('verifying');
  const [dotCount, setDotCount] = useState(0);

  // Animate the "Verifying" dots
  useEffect(() => {
    if (state !== 'verifying') return;
    const interval = setInterval(() => setDotCount((c) => (c + 1) % 4), 500);
    return () => clearInterval(interval);
  }, [state]);

  // Poll the order every 2 seconds until the webhook marks it paid/failed
  useEffect(() => {
    if (!orderId) {
      setState('failed');
      return;
    }

    let stopped = false;

    const poll = async () => {
      try {
        const res = await axiosInstance.get(`/order/${orderId}`);
        const order = res.data?.data;

        if (order?.paymentStatus === 'paid') {
          if (!stopped) setState('paid');
          return true; // stop polling
        }
        if (order?.paymentStatus === 'failed') {
          if (!stopped) setState('failed');
          return true;
        }
        return false; // keep polling
      } catch {
        if (!stopped) setState('failed');
        return true;
      }
    };

    // Start polling
    const interval = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(interval);
    }, 2000);

    // Stop after 30 seconds and show timeout state
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!stopped) setState('timeout');
    }, 30000);

    // Run once immediately so we don't wait 2s for the first check
    poll();

    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId]);

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (state === 'verifying') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-100">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Confirming Payment{'.'.repeat(dotCount)}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we verify your transaction with Worldpay.
            <br />
            Do not close this tab.
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-64 overflow-hidden rounded-full bg-gray-200">
          <div className="h-1.5 animate-[progress_30s_linear_forwards] rounded-full bg-blue-500" />
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (state === 'paid') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-300 opacity-30" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-100">
            <CheckCircle size={52} className="text-green-500" />
          </div>
        </div>

        {/* Message */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Payment Successful!
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-gray-500">
            Your payment has been confirmed and you are now enrolled. Happy
            learning! 🎉
          </p>
          {orderId && (
            <p className="mt-2 text-xs text-gray-400">
              Order ref: <span className="font-mono">{orderId}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-supperagent px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            <BookOpen size={18} />
            Go to My Courses
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Browse More Courses
          </button>
        </div>
      </div>
    );
  }

  // ── Timeout (Webhook delayed) ──────────────────────────────────────────────
  if (state === 'timeout') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50 ring-8 ring-yellow-100">
          <Clock size={52} className="text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Payment Confirmation Pending
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Your payment was received by Worldpay but confirmation is taking
            longer than expected. This is usually resolved within a few minutes.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Check your email for a confirmation, or visit your dashboard
            shortly.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-supperagent px-8 py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.98]"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100">
        <XCircle size={52} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Payment Failed
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          Your payment could not be processed. No money has been charged. Please
          try again or use a different payment method.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate('/checkout')}
          className="inline-flex items-center gap-2 rounded-xl bg-supperagent px-8 py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.98]"
        >
          Try Again
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
}
