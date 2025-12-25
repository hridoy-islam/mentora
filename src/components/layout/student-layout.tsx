import { Mail, Phone } from 'lucide-react';
import { Footer } from '../shared/Footer';
import { StudentNav } from '../shared/student-nav';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Top contact bar */}
      {/* <div className="bg-supperagent h-12 p-4 text-white">
        <div className="container mx-auto flex h-full items-center justify-start  gap-8">
          
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4" />
            <a href="mailto:info@example.com" className="hover:text-gray-100">
              info@edulab.com
            </a>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4" />
            <a href="tel:+123456789" className="hover:text-gray-100 ">
              +1 (234) 567-890
            </a>
          </div>
          
        </div>
      </div> */}

      <StudentNav />

      <main className="overflow-hidden ">{children}</main>
    </div>
  );
}
