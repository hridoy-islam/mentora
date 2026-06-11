import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Home,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/lib/axios';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/features/cartSlice';
import { useEffect, useRef, useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────
type PaymentState = 'verifying' | 'paid' | 'failed' | 'pending' | 'timeout';

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const pulseRingVariants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.4, 0, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ─── Payment Success Page ──────────────────────────────────────────────────────
export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const dispatch = useDispatch();

  const [state, setState] = useState<PaymentState>('verifying');
  const [dotCount, setDotCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const pollingRef = useRef<{
    interval: NodeJS.Timeout | null;
    timeout: NodeJS.Timeout | null;
  }>({ interval: null, timeout: null });

  // Animate the "Verifying" dots
  useEffect(() => {
    if (state !== 'verifying') return;
    const interval = setInterval(() => setDotCount((c) => (c + 1) % 4), 500);
    return () => clearInterval(interval);
  }, [state]);

  // Progress animation for verifying state
  useEffect(() => {
    if (state !== 'verifying') return;
    const duration = 30000; // 30 seconds
    const interval = 100;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [state]);

  // Clear cart when payment is confirmed
  useEffect(() => {
    if (state === 'paid') {
      dispatch(clearCart());
    }
  }, [state, dispatch]);

  useEffect(() => {
    if (!orderId) {
      setState('failed');
      return;
    }

    let stopped = false;

    const stopPolling = () => {
      if (pollingRef.current.interval) {
        clearInterval(pollingRef.current.interval);
        pollingRef.current.interval = null;
      }
      if (pollingRef.current.timeout) {
        clearTimeout(pollingRef.current.timeout);
        pollingRef.current.timeout = null;
      }
    };

    const poll = async () => {
      if (stopped) return;

      try {
        const res = await axiosInstance.get(`/order/${orderId}`);
        const order = res.data?.data;

        if (order?.paymentStatus === 'paid') {
          if (!stopped) {
            setState('paid');
            stopPolling();

          }
          return;
        }
        if (order?.paymentStatus === 'failed') {
          if (!stopped) {
            setState('failed');
            stopPolling();
          }
          return;
        }
      } catch {
        if (!stopped) {
          setState('failed');
          stopPolling();
        }
      }
    };

    pollingRef.current.interval = setInterval(poll, 2000);
    pollingRef.current.timeout = setTimeout(() => {
      if (!stopped) {
        setState('timeout');
        stopPolling();
      }
    }, 30000);

    poll();

    return () => {
      stopped = true;
      stopPolling();
    };
  }, [orderId]);

  // ── Background Pattern Component ─────────────────────────────────────────────
  const BackgroundPattern = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-slate-200/20 to-transparent rounded-full" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (state === 'verifying') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4" style={{ zIndex: 1 }}>
        <BackgroundPattern />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col items-center gap-8 max-w-md w-full"
          style={{ zIndex: 10 }}
        >
          {/* Animated Icon */}
          <motion.div variants={scaleVariants} className="relative">
            <motion.div
              variants={pulseRingVariants}
              animate="animate"
              className="absolute inset-0 rounded-full bg-blue-400/20"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-100/50 ring-1 ring-blue-100">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Confirming Payment
              <span className="inline-block w-8 text-left">{'.'.repeat(dotCount)}</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              We're securely verifying your transaction with our payment provider.
              <span className="block mt-1 text-slate-400 text-xs">Please keep this window open</span>
            </p>
          </motion.div>

          

         
        </motion.div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (state === 'paid') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4" style={{ zIndex: 1 }}>
        <BackgroundPattern />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col items-center gap-8 max-w-lg w-full"
          style={{ zIndex: 10 }}
        >
          {/* Success Icon with Celebration */}
          <motion.div variants={scaleVariants} className="relative">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-amber-400" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
            />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-emerald-100/50 ring-1 ring-emerald-100">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <CheckCircle size={48} className="text-emerald-500" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold tracking-tight text-slate-900"
            >
              Payment Successful
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 leading-relaxed max-w-sm mx-auto"
            >
              Your enrollment is complete! You now have full access to your course materials.
            </motion.p>
           
          </motion.div>

         
          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-sm pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/courses')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30"
            >
              Browse More Courses
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </motion.button>

           
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Timeout (Webhook delayed) ──────────────────────────────────────────────
  if (state === 'timeout') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4" style={{ zIndex: 1 }}>
        <BackgroundPattern />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col items-center gap-8 max-w-lg w-full"
          style={{ zIndex: 10 }}
        >
          {/* Icon */}
          <motion.div variants={scaleVariants} className="relative">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                transition: { duration: 4, repeat: Infinity }
              }}
              className="absolute inset-0 rounded-full bg-amber-400/10 blur-xl"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl shadow-amber-100/30 ring-1 ring-amber-100">
              <Clock size={48} className="text-amber-500" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Confirmation Pending
            </h1>
            <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Your payment was received but we're waiting for final confirmation from our provider. 
              This typically resolves within a few minutes.
            </p>
           
          </motion.div>

         

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-sm pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
            >
              <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
              Check Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-white"
            >
              <Home size={16} />
              Go to Dashboard
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4" style={{ zIndex: 1 }}>
      <BackgroundPattern />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center gap-8 max-w-lg w-full"
        style={{ zIndex: 10 }}
      >
        {/* Icon */}
        <motion.div variants={scaleVariants} className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.1, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-400/20 blur-xl"
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl shadow-red-100/30 ring-1 ring-red-100">
            <XCircle size={48} className="text-red-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payment Failed
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
            We couldn't process your payment. No charges have been made to your account.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-100 mt-2">
            <ShieldCheck size={12} className="text-red-400" />
            <span className="text-xs text-red-600 font-medium">Your card was not charged</span>
          </div>
        </motion.div>

        
        {/* Actions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-sm pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
          >
            Try Again
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/courses')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-white"
          >
            <BookOpen size={16} />
            Back to Courses
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}