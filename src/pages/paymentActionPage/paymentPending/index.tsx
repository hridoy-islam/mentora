// Route: /payment/pending?orderId=xxx

import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Worldpay redirects here when a payment needs manual review (rare).
export function PaymentPendingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-50 ring-8 ring-yellow-100">
        <Clock size={52} className="text-yellow-500" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Payment Under Review
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          Your payment is currently being reviewed by your bank. This usually
          takes a few minutes. You'll receive a confirmation email once it's
          approved.
        </p>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 rounded-xl bg-supperagent px-8 py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.98]"
      >
        Go to Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}
