import { Mail, Phone } from "lucide-react";
import { Footer } from "../shared/Footer";
import { TopNav } from "../shared/top-nav";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const location = useLocation();

  const navigate = useNavigate()

 useEffect(() => {
    
      if (location.pathname !== "/") {
        window.scrollTo(0, 0);
      }
    
  }, [location.pathname]);



 return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white">
      
      {/* Top contact bar */}
      <div className="bg-supperagent h-12 text-white">
        <div className="container mx-auto flex h-full items-center justify-start  gap-8">
          
          {/* Email */}
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4" />
            <a href="mailto:info@example.com" className="hover:text-gray-100">
              info@edulab.com
            </a>
          </div>

          {/* Phone Number */}
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4" />
            <a href="tel:+123456789" className="hover:text-gray-100 ">
              +1 (234) 567-890
            </a>
          </div>
          
        </div>
      </div>
      
      <TopNav />
      
      <main className="overflow-auto "> {/* Added classes for scrolling */}
        {children}
      </main>
      <Footer/>
    </div>
  );
}
