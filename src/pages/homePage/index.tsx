import HeroSection from "./components/HeroSection";
import SaferCareSection from "./components/StatsSection";
import TrainingForOrganisationsSection from "./components/TrainingForOrganisationsSection";
import FeaturedCoursesSection from "./components/FeaturedCoursesSection";
import WhyChooseSection from "./components/WhyChooseSection";
import HowItWorksSection from "./components/HowItWorksSection";
import LearningExperienceSection from "./components/LearningExperienceSection";
import SupportingSection from "./components/SupportingCareTeamsSection";
import CTASection from "./components/CTASection";

export default function HomePage() {
  return (
    <div className="bg-background overflow-x-hidden">
      <HeroSection />
      <SaferCareSection />
      <FeaturedCoursesSection />
      <WhyChooseSection />
      <LearningExperienceSection />
      <HowItWorksSection />
      <TrainingForOrganisationsSection />
      <SupportingSection />
      <CTASection />
    </div>
  );
}