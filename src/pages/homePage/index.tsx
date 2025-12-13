import CategoriesSection from "./components/CategoriesSection";
import CTASection from "./components/CTASection";
import FeaturedCoursesSection from "./components/FeaturedCoursesSection";
import GetCertifiedSection from "./components/GetCertifiedSection";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import StatsSection from "./components/StatsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import TrustedBySection from "./components/TrustedBySection";


export default function HomePage() {
  return (
    <div className="bg-background overflow-x-hidden">
     
      <HeroSection />
      <StatsSection />
      <TrustedBySection />
      <FeaturedCoursesSection />
      <CategoriesSection />
      <HowItWorksSection />
      <GetCertifiedSection/>
      <TestimonialsSection />
      
      <CTASection />
    </div>
  );
}
