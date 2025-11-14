import {
  GraduationCap,
  Heart,
  ShoppingCart,
  User,
  ArrowUpRight
} from 'lucide-react';
import { NavLink as RouterNavLink } from 'react-router-dom';

// Logo stays the same
function Logo() {
  return (
    <RouterNavLink to="/" className="flex items-center space-x-2">
      <GraduationCap className="h-10 w-10 text-supperagent" />
      <span className="text-3xl font-bold text-supperagent">Mentora</span>
    </RouterNavLink>
  );
}

// Updated NavLink using react-router-dom NavLink
function NavLink({ to, children }) {
  return (
    <li>
      <RouterNavLink
        to={to}
        className={({ isActive }) =>
          `pb-1 ${
            isActive
              ? 'text-supperagent border-b-2 border-supperagent font-medium'
              : 'text-gray-600 hover:text-supperagent'
          }`
        }
      >
        {children}
      </RouterNavLink>
    </li>
  );
}

export function TopNav() {
  return (
    <div className="flex items-center justify-between bg-white shadow-sm z-[9999] p-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-40">
          <Logo />
          <nav>
            <ul className="flex items-center space-x-8 font-medium">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </ul>
          </nav>
        </div>

        {/* Right Side: Icons + Auth Buttons */}
        <div className="flex items-center space-x-4">
          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Heart className="h-5 w-5" />
          </button>

          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-supperagent text-xs text-white">
              1
            </span>
          </button>

          <RouterNavLink
            to="/login"
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span>Log in</span>
          </RouterNavLink>

          <RouterNavLink
            to="/signup"
            className="flex items-center space-x-2 rounded-md bg-supperagent px-4 py-2 text-sm font-medium text-white hover:bg-supperagent/90"
          >
            <span>Sign up</span>
            <ArrowUpRight className="h-4 w-4" />
          </RouterNavLink>
        </div>
      </div>
    </div>
  );
}
