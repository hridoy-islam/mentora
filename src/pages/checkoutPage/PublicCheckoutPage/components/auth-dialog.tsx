import { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Icon for the close button
import { LoginForm } from './login-form';
import { SignUpForm } from './signup-form';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [view, setView] = useState<'login' | 'signup'>('login');

  // Prevent scrolling on the body when the modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSwitchToSignup = () => setView('signup');
  const handleSwitchToLogin = () => setView('login');

  // Reset view when dialog closes
  const handleClose = () => {
    onOpenChange(false);
    // Small timeout to reset view after animation/close
    setTimeout(() => setView('login'), 300);
  };

  // If not open, don't render anything
  if (!open) return null;

  return (
    // 1. Overlay Wrapper (Fixed to viewport)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* 2. Backdrop (Dark background) */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={handleClose} 
        aria-hidden="true"
      />

      {/* 3. Modal Content */}
      <div className="relative z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button ('X') */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header Section */}
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500">
            {view === 'login'
              ? 'Please login to continue checkout.'
              : 'Join us to purchase courses.'}
          </p>
        </div>

        {/* Content Section */}
        <div>
          {view === 'login' ? (
            <LoginForm
              onSuccess={() => handleClose()}
              onSwitchToSignup={handleSwitchToSignup}
            />
          ) : (
            <SignUpForm
              onSuccess={handleSwitchToLogin}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
} 