import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export function OrderSuccess() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state

  return (
    <div className="container mx-auto py-24 text-center">
      <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-10 shadow-xl">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Order Successful!
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          Thank you for your purchase. You can now access your courses in your
          dashboard.
        </p>
        <div
          onClick={() => {
            if (user?.role === 'student') navigate('/student');
            else if (['admin', 'instructor', 'company'].includes(user?.role))
              navigate('/dashboard');
          }}
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-supperagent px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-supperagent/90"
        >
          Go to My Courses
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
