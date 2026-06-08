import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';          // ← THE KEY FIX
import {
  ShoppingCart,
  User,
  BookOpen,
  LogOut,
  Menu,
  X,
  Building,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { logout } from '@/redux/features/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ onClick, disabled }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        if (disabled) return;
        navigate('/student');
        if (onClick) onClick();
      }}
      className={`flex items-center space-x-2 ${
        disabled ? '' : 'cursor-pointer transition-opacity hover:opacity-80'
      }`}
    >
      <img src="/logo.png" alt="logo" width={120} />
    </div>
  );
}

// ─── Desktop NavLink ──────────────────────────────────────────────────────────
function NavLink({ to, children, end = false }) {
  return (
    <li>
      <RouterNavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `text-sm font-semibold transition-colors hover:text-supperagent ${
            isActive ? 'text-supperagent' : 'text-gray-800'
          }`
        }
      >
        {children}
      </RouterNavLink>
    </li>
  );
}

// ─── NavUser ──────────────────────────────────────────────────────────────────
export function NavUser({ user, isOpen }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-1.5 transition-all duration-200 ${
        isOpen
          ? 'border-supperagent bg-gray-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <Avatar className="h-8 w-8 rounded-md flex-shrink-0">
        <AvatarImage src={user?.image} alt={user?.name} />
        <AvatarFallback className="rounded-md bg-gray-100 text-gray-600 font-bold">
          {user?.name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="hidden lg:grid flex-1 text-left text-sm leading-tight min-w-[100px]">
        <span className="truncate font-semibold text-gray-900">{user?.name}</span>
        <span className="truncate text-xs text-gray-500">{user?.email}</span>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-supperagent' : ''
        }`}
      />
    </div>
  );
}

// ─── MobileMenu — rendered via Portal straight into document.body ─────────────
//
// ROOT CAUSE OF THE BUG:
// The overlay was a child of <div className="sticky top-0 z-[9999]">.
// A `position: sticky` element creates a new stacking context. Any
// `position: fixed` child is clipped/positioned relative to that stacking
// context, NOT the viewport — so it only covered the navbar's own box.
//
// THE FIX: createPortal(overlay, document.body) moves the overlay completely
// out of the sticky nav's DOM subtree and appends it directly to <body>.
// Now `position: fixed; inset: 0` truly means the full viewport.
//
function MobileMenu({ isOpen, onClose, user, mobileLinks, handleLogout }) {
  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // fixed + inset-0 + z-[99999] — works because this is now a direct
          // child of <body>, free from any stacking/clipping ancestor
          style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
          className="flex flex-col bg-white"
        >
          {/* Header */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 px-4">
            <Logo onClick={onClose} />
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* User card */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className="mb-8 flex items-center gap-4 rounded-xl bg-gray-50 p-4"
              >
                <Avatar className="h-12 w-12 flex-shrink-0 rounded-lg">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback className="rounded-lg bg-white font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
              </motion.div>
            )}

            {/* Nav links */}
            {mobileLinks.map(({ to, label, end }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.28 }}
              >
                <RouterNavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block border-b border-gray-100 py-4 text-lg font-medium transition-colors ${
                      isActive ? 'text-supperagent' : 'text-gray-800'
                    }`
                  }
                >
                  {label}
                </RouterNavLink>
              </motion.div>
            ))}

            {/* Sign out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-8"
            >
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Portal renders the overlay as a direct child of <body>
  return createPortal(overlay, document.body);
}

// ─── StudentNav ───────────────────────────────────────────────────────────────
export function StudentNav() {
  const [isCartOpen,       setIsCartOpen]       = useState(false);
  const [isUserOpen,       setIsUserOpen]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cartItems, totalQuantity } = useSelector((state) => state.cart);
  const { user }                     = useSelector((state) => state.auth);
  const dispatch                     = useDispatch();
  const navigate                     = useNavigate();
  const location                     = useLocation();

  const cartButtonRef   = useRef(null);
  const cartDropdownRef = useRef(null);
  const userButtonRef   = useRef(null);
  const userDropdownRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Close all panels on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (
        isCartOpen &&
        !cartButtonRef.current?.contains(e.target) &&
        !cartDropdownRef.current?.contains(e.target)
      ) setIsCartOpen(false);

      if (
        isUserOpen &&
        !userButtonRef.current?.contains(e.target) &&
        !userDropdownRef.current?.contains(e.target)
      ) setIsUserOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isCartOpen, isUserOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserOpen(false);
    setIsMobileMenuOpen(false);
  };

  const mobileLinks = [
    { to: '/student',              label: 'Dashboard',        end: true },
    { to: '/courses',              label: 'Explore Courses' },
    { to: '/student/my-courses',   label: 'My Learning' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/profile',      label: 'Profile' },
    { to: '/student/transactions', label: 'Billing & History' },
    ...(user?.organizationId
      ? [{ to: `/student/my-organization/${user.organizationId}/available-course`, label: 'My Organization' }]
      : []),
  ];

  return (
    <>
      {/* ── Sticky navbar bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-[9999] border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">

            <div className="flex flex-shrink-0 items-center">
              <Logo disabled={isAdmin} />
            </div>

            {!isAdmin && (
              <>
                {/* Desktop nav */}
                <nav className="hidden xl:flex flex-1 items-center justify-center">
                  <ul className="flex items-center space-x-8">
                    <NavLink to="/student" end>Dashboard</NavLink>
                    {user?.organizationId && (
                      <NavLink
                        to={`/student/my-organization/${user.organizationId}/available-course`}
                      >
                        My Organization
                      </NavLink>
                    )}
                    <NavLink to="/courses">Explore Courses</NavLink>
                    <NavLink to="/contact">Contact</NavLink>
                  </ul>
                </nav>

                {/* Right actions */}
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">

                  {/* Cart */}
                  <div className="relative">
                    <button
                      ref={cartButtonRef}
                      onClick={() => { setIsCartOpen((v) => !v); setIsUserOpen(false); }}
                      className={`relative rounded-full p-2 transition-colors hover:bg-gray-100 ${
                        isCartOpen ? 'bg-gray-100 text-supperagent' : 'text-gray-500'
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {totalQuantity > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-supperagent text-[10px] font-bold text-white">
                          {totalQuantity}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isCartOpen && (
                        <motion.div
                          ref={cartDropdownRef}
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-100 bg-white p-4 shadow-2xl ring-1 ring-black/5"
                        >
                          <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-2">
                            <h3 className="text-sm font-bold text-gray-900">Shopping Cart</h3>
                            <span className="rounded-full bg-supperagent/10 px-2 py-0.5 text-xs font-medium text-supperagent">
                              {totalQuantity} Items
                            </span>
                          </div>
                          {cartItems.length > 0 ? (
                            <div className="space-y-4">
                              <div className="max-h-[300px] space-y-3 overflow-y-auto">
                                {cartItems.map((item) => (
                                  <div key={item.id} className="flex gap-3">
                                    <img
                                      src={item.image || '/placeholder.jpg'}
                                      className="h-12 w-12 rounded object-cover"
                                      alt={item.title}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-bold text-gray-900">{item.title}</p>
                                      <p className="text-xs font-bold text-supperagent">${item.price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => { navigate('/cart'); setIsCartOpen(false); }}
                                className="w-full rounded-lg bg-supperagent py-2 text-sm font-bold text-white hover:bg-opacity-90"
                              >
                                View All Cart
                              </button>
                            </div>
                          ) : (
                            <p className="py-4 text-center text-sm text-gray-500">Cart is empty</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User dropdown — desktop only */}
                  <div className="relative hidden md:block">
                    <button
                      ref={userButtonRef}
                      onClick={() => { setIsUserOpen((v) => !v); setIsCartOpen(false); }}
                      className="flex items-center"
                    >
                      <NavUser user={user} isOpen={isUserOpen} />
                    </button>

                    <AnimatePresence>
                      {isUserOpen && (
                        <motion.div
                          ref={userDropdownRef}
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5"
                        >
                          <div className="border-b border-gray-100 bg-gray-50/50 p-4">
                            <p className="truncate text-sm font-bold text-gray-900">{user?.name}</p>
                            <p className="truncate text-xs text-gray-500">{user?.email}</p>
                          </div>
                          <div className="p-2">
                            {[
                              { icon: User,       label: 'My Profile',        to: '/student/profile' },
                              { icon: BookOpen,   label: 'My Learning',       to: '/student/my-courses' },
                              { icon: CreditCard, label: 'Billing & History', to: '/student/transactions' },
                            ].map(({ icon: Icon, label, to }) => (
                              <button
                                key={to}
                                onClick={() => { navigate(to); setIsUserOpen(false); }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Icon className="h-4 w-4 text-gray-400" />
                                <span>{label}</span>
                              </button>
                            ))}
                            {user?.organizationId && (
                              <button
                                onClick={() => {
                                  navigate(`/student/my-organization/${user.organizationId}/available-course`);
                                  setIsUserOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Building className="h-4 w-4 text-gray-400" />
                                <span>My Organization</span>
                              </button>
                            )}
                          </div>
                          <div className="border-t border-gray-100 bg-gray-50/30 p-2">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hamburger */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 xl:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile overlay — rendered via Portal into document.body ────────
           This completely escapes the sticky nav's stacking context so
           position:fixed truly means the full viewport, not just the nav box.
      ─────────────────────────────────────────────────────────────────────── */}
      {!isAdmin && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          mobileLinks={mobileLinks}
          handleLogout={handleLogout}
        />
      )}
    </>
  );
}