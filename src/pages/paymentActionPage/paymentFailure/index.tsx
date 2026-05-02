import { ArrowRight, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Route: /payment/failure?orderId=xxx
// Worldpay redirects here on a declined transaction.
export function PaymentFailurePage() {
  const navigate = useNavigate();
 
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100">
        <XCircle size={52} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Payment Declined</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          Worldpay was unable to process your payment. This could be due to
          insufficient funds, an incorrect card number, or your bank declining
          the transaction. No charge has been made.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate('/checkout')}
          className="inline-flex items-center gap-2 rounded-xl bg-supperagent px-8 py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.98]"
        >
          Try Again <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
}