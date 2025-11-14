

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
} from "lucide-react";

// A simple stand-in for a Google Play icon
const GooglePlayIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="w-5 h-5"
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
      <footer className="bg-white">
        <div className="container mx-auto  py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 lg:col-span-1 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 ">
                Mentora
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-supperagent" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-supperagent" />
                  <span>support@mentora.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-supperagent mt-1" />
                  <span>
                    123 Learning Ave #100
                    <br />
                    San Francisco, CA 94101
                  </span>
                </li>
              </ul>
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-white hover:bg-supperagent"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-white hover:bg-supperagent"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-white hover:bg-supperagent"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-white hover:bg-supperagent"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900  text-lg">
                Company
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-supperagent">About</a></li>
                <li><a href="#" className="hover:text-supperagent">Courses</a></li>
                <li><a href="#" className="hover:text-supperagent">Instructors</a></li>
                <li><a href="#" className="hover:text-supperagent">Events</a></li>
                <li><a href="#" className="hover:text-supperagent">Become a Teacher</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900  text-lg">
                Useful Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-supperagent">Testimonials</a></li>
                <li><a href="#" className="hover:text-supperagent">Pricing</a></li>
                <li><a href="#" className="hover:text-supperagent">FAQs</a></li>
                <li><a href="#" className="hover:text-supperagent">Help Center</a></li>
                <li><a href="#" className="hover:text-supperagent">Terms</a></li>
                <li><a href="#" className="hover:text-supperagent">Sitemap</a></li>
                <li><a href="#" className="hover:text-supperagent">Privacy</a></li>
              </ul>
            </div>

           

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900  text-lg">
                Subscribe
              </h3>
              <p className="text-sm">
                2000+ Our students are subscribe Around the World. Don’t be
                shy introduce yourself!
              </p>
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your e-mail"
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-supperagent hover:bg-blue-100 dark:hover:bg-gray-800"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              <h3 className="font-semibold text-gray-900  text-lg pt-4">
                Get the app
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <Apple className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">Apple Store</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <GooglePlayIcon className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">Get in on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t dark:border-gray-400">
          <div className="container mx-auto  py-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Mentora. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg"
          size="icon"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}