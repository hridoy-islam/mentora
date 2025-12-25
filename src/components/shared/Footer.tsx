import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const navigate = useNavigate();

  function Logo({ onClick }) {
    const navigate = useNavigate();
    return (
      <div
        onClick={() => {
          navigate("/");
          if (onClick) onClick();
        }}
        className="flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-80"
      >
        <img src="/logo.png" alt="medicare" width={120} />
      </div>
    );
  }

  return (
    <>
      <footer className="relative bg-slate-50 pt-20 pb-10 overflow-hidden border-t border-gray-200">
        {/* --- Visual Objects (Decorations) --- */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-supperagent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
          <svg width="100" height="100" fill="none">
            <pattern
              id="dots"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="2"
                className="text-gray-400"
                fill="currentColor"
              />
            </pattern>
            <rect width="100" height="100" fill="url(#dots)" />
          </svg>
        </div>

        {/* --- Main Content --- */}
        <div className="container relative z-10 mx-auto px-6">
          {/* GRID ADJUSTMENT:
              - Changed to lg:grid-cols-4 
              - First item spans 2 columns (lg:col-span-2)
              - Remaining 2 items take 1 column each
              - This creates a balanced [ 50% | 25% | 25% ] layout
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Column 1: Brand & Contact (Takes up 2 slots width) */}
            <div className="space-y-6 lg:col-span-2">
              <Logo />

              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Empowering learners worldwide with accessible, high quality
                education. Join the revolution today.
              </p>

              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all">
                    <Phone className="w-4 h-4 text-supperagent" />
                  </div>
                  <span className="group-hover:text-supperagent transition-colors">
                    +1 (555) 123-4567
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all">
                    <Mail className="w-4 h-4 text-supperagent" />
                  </div>
                  <span className="group-hover:text-supperagent transition-colors">
                    support@MedicareTraining.com
                  </span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all mt-[-2px]">
                    <MapPin className="w-4 h-4 text-supperagent" />
                  </div>
                  <span className="group-hover:text-supperagent transition-colors leading-tight">
                    123 Learning Ave #100
                    <br />
                    San Francisco, CA 94101
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 2: Company Links */}
            {/* Removed lg:pl-8 to fix alignment */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-6">Company</h3>
              <ul className="space-y-3">
                {[
                  "About Us",
                  "All Courses",
                  "Our Instructors",
                  "Upcoming Events",
                  "Become a Teacher",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center text-sm text-gray-500 hover:text-supperagent transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Useful Links */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                {[
                  "Testimonials",
                  "Pricing Plans",
                  "FAQs",
                  "Help Center",
                  "Terms of Service",
                  "Privacy Policy",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center text-sm text-gray-500 hover:text-supperagent transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="relative z-10 mt-16 pt-8 border-t border-gray-200/60">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Medicare Training Inc. All Rights
              Reserved.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="p-2 text-gray-400 transition-all duration-300 hover:text-white hover:bg-supperagent rounded-full hover:shadow-lg hover:shadow-supperagent/30"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full shadow-2xl bg-supperagent hover:bg-supperagent/90 text-white animate-bounce-in "
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}