import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  Apple,
  ArrowUp,
  ChevronRight,
  GraduationCap
} from "lucide-react";

// Google Play Icon Component
const GooglePlayIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="20"
    height="20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M325.3 234.3 12.9 491.1c-2.3 1.3-4.9 2.1-7.7 2.1-8.5 0-15.4-6.9-15.4-15.4V34.2c0-8.5 6.9-15.4 15.4-15.4 2.8 0 5.4.8 7.7 2.1L325.3 234.3c5.8 3.3 5.8 12.1 0 15.4zM499.1 218.4l-118.8-68.5-125.7 125.7 125.7 125.7 118.8-68.5c11.7-6.7 11.7-24.1 0-30.8zM371.4 349.7 232.1 234.3c-5.8-3.3-5.8-12.1 0-15.4l139.3-115.4c11.7-6.7 11.7-24.1 0-30.8l-118.8-68.5-125.7 125.7 125.7 125.7 118.8 68.5c11.7 6.7 11.7 24.1 0 30.8z"
    />
  </svg>
);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Subscribed! (Demo)");
  };

  return (
    <>
      <footer className="relative bg-slate-50 pt-20 pb-10 overflow-hidden border-t border-gray-200">
        
        {/* --- Visual Objects (Decorations) --- */}
        {/* Soft Gradient Blob Top Left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-supperagent/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Soft Gradient Blob Bottom Right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        
        {/* Dot Pattern Overlay (Top Right) */}
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
            <svg width="100" height="100" fill="none">
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="2" className="text-gray-400" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots)" />
            </svg>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Column 1: Brand & Contact */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-supperagent text-white shadow-lg shadow-supperagent/20">
                   <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Mentora</span>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Empowering learners worldwide with accessible, high-quality education. Join the revolution today.
              </p>

              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all">
                     <Phone className="w-4 h-4 text-supperagent" />
                  </div>
                  <span className="group-hover:text-supperagent transition-colors">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all">
                     <Mail className="w-4 h-4 text-supperagent" />
                  </div>
                  <span className="group-hover:text-supperagent transition-colors">support@mentora.com</span>
                </li>
                <li className="flex items-start gap-3 group">
                   <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-gray-100 group-hover:ring-supperagent/50 transition-all mt-[-2px]">
                     <MapPin className="w-4 h-4 text-supperagent" />
                   </div>
                  <span className="group-hover:text-supperagent transition-colors leading-tight">
                    123 Learning Ave #100<br />
                    San Francisco, CA 94101
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 2: Company Links */}
            <div className="lg:pl-8">
              <h3 className="font-bold text-gray-900 text-lg mb-6">Company</h3>
              <ul className="space-y-3">
                {['About Us', 'All Courses', 'Our Instructors', 'Upcoming Events', 'Become a Teacher'].map((item) => (
                  <li key={item}>
                    <a href="#" className="group flex items-center text-sm text-gray-500 hover:text-supperagent transition-colors">
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
                {['Testimonials', 'Pricing Plans', 'FAQs', 'Help Center', 'Terms of Service', 'Privacy Policy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="group flex items-center text-sm text-gray-500 hover:text-supperagent transition-colors">
                      <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Newsletter & App */}
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 text-lg">Stay Updated</h3>
              <p className="text-sm text-gray-500">
                Join 2000+ students. Get the latest news and course offers.
              </p>
              
              {/* Modern Pill Input */}
              <form onSubmit={handleSubscribe} className="relative group">
                <Input
                  type="email"
                  placeholder="Your e-mail address"
                  className="w-full h-12 rounded-full border-gray-200 bg-white pr-12 pl-5 focus:ring-2 focus:ring-supperagent/20 focus:border-supperagent transition-all shadow-sm group-hover:shadow-md"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 rounded-full bg-supperagent hover:bg-supperagent/90 text-white shadow-md transition-transform hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>

              
            </div>

          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="relative z-10 mt-16 pt-8 border-t border-gray-200/60">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Mentora Inc. All Rights Reserved.
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