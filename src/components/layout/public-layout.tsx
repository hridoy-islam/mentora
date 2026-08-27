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
    <div className="flex min-h-screen flex-col overflow-hidden bg-white relative">
      
      {/* Top contact bar */}
      <div className="bg-supperagent h-auto min-h-12 text-white relative z-[99999]">
  <div className="container mx-auto flex min-h-12 flex-wrap items-center justify-start gap-x-6 gap-y-2 px-4 py-2 sm:px-6 md:gap-8">
    
    {/* Email */}
    <div className="flex items-center space-x-2 text-xs sm:text-sm">
      <Mail className="h-4 w-4 shrink-0" />
      <a
        href="mailto:support@medicaretraining.co.uk"
        className="hover:text-gray-100 break-all"
      >
        support@medicaretraining.co.uk
      </a>
    </div>

    {/* Phone Number */}
    <div className="flex items-center space-x-2 text-xs sm:text-sm">
      <Phone className="h-4 w-4 shrink-0" />
      <a
        href="tel:07914829155"
        className="hover:text-gray-100 whitespace-nowrap"
      >
        07914829155
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
