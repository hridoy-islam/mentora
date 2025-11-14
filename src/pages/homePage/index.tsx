import React from 'react';
import {
  BookOpen,
  Zap,
  Users,
  BarChart,
  Star,
  PlayCircle,
  ChevronRight,
  Award,
  Globe,
  Brain
} from 'lucide-react';

// --- Reusable Components ---

/**
 * A reusable button component with primary styling.
 * Uses 'supperagent' for the background.
 */
const PrimaryButton = ({ children, className = '' }) => (
  <button
    className={`transform rounded-lg bg-supperagent px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-supperagent/90 ${className}`}
  >
    {children}
  </button>
);

/**
 * A reusable button component with secondary (outline) styling.
 * Uses 'supperagent' for the text and border.
 */
const SecondaryButton = ({ children, className = '' }) => (
  <button
    className={`transform rounded-lg border border-supperagent bg-white px-6 py-3 font-semibold text-supperagent shadow-md transition-transform hover:scale-105 hover:bg-supperagent/10 ${className}`}
  >
    {children}
  </button>
);

/**
 * Header/Navigation Bar Component
 */
const Header = () => {
  const navItems = ['Courses', 'For Business', 'About', 'Blog'];

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-3xl font-bold text-supperagent">Mentora</div>

        {/* Navigation Links - Centered */}
        <div className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="font-medium text-black/80 transition-colors hover:text-supperagent"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <button className="font-medium text-black/80 hover:text-supperagent">
            Sign In
          </button>
          <PrimaryButton className="hidden !px-5 !py-2 sm:block">
            Get Started
          </PrimaryButton>
        </div>
      </nav>
    </header>
  );
};

/**
 * Hero Section Component
 */
const HeroSection = () => (
  <section className="bg-white pb-20 pt-32 text-center">
    {' '}
    {/* Changed bg to white */}
    <div className="container mx-auto px-6">
      <h1 className="mb-6 text-5xl font-extrabold leading-tight text-black md:text-6xl">
        {' '}
        {/* Changed text to black */}
        Unlock Your Potential with Mentora
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-xl text-black/70">
        {' '}
        {/* Changed text color */}
        Your gateway to knowledge. Learn from industry experts, master in-demand
        skills, and achieve your goals with our interactive online courses.
      </p>
      <div className="flex items-center justify-center space-x-4">
        <PrimaryButton className="!text-lg">Get Started for Free</PrimaryButton>
        <SecondaryButton className="flex items-center space-x-2 !text-lg">
          <PlayCircle className="h-5 w-5" />
          <span>Watch Intro</span>
        </SecondaryButton>
      </div>
    </div>
  </section>
);

/**
 * Feature Card Component
 */
const FeatureCard = ({ icon, title, description }) => (
  <div className="transform rounded-lg bg-white p-6 shadow-md transition-shadow hover:-translate-y-1 hover:shadow-xl">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-supperagent/10">
      {' '}
      {/* Changed icon bg */}
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold text-black">{title}</h3>{' '}
    {/* Changed text to black */}
    <p className="text-black/70">{description}</p> {/* Changed text color */}
  </div>
);

/**
 * Features Section Component
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-supperagent" />, // Changed icon text
      title: 'Expert-Led Courses',
      description:
        'Learn from seasoned professionals at the top of their fields.'
    },
    {
      icon: <Zap className="h-6 w-6 text-supperagent" />, // Changed icon text
      title: 'Interactive Learning',
      description:
        'Engage with quizzes, projects, and live sessions to build real skills.'
    },
    {
      icon: <Users className="h-6 w-6 text-supperagent" />, // Changed icon text
      title: 'Community Access',
      description:
        'Connect with peers, mentors, and alumni in our exclusive network.'
    },
    {
      icon: <Award className="h-6 w-6 text-supperagent" />, // Changed icon text
      title: 'Career Certificates',
      description:
        'Earn recognized certificates to boost your resume and LinkedIn profile.'
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-black">
          {' '}
          {/* Changed text to black */}
          Why Learn with Mentora?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Course Card Component
 */
const CourseCard = ({ title, category, instructor, imageSrc }) => (
  <div className="transform overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105">
    <img
      src={imageSrc}
      alt={title}
      className="h-48 w-full object-cover"
      onError={(e) =>
        (e.currentTarget.src = 'https://placehold.co/400x300?text=Course')
      }
    />
    <div className="p-6">
      <span className="mb-2 inline-block rounded-full bg-supperagent/10 px-2 py-1 text-xs font-semibold text-supperagent">
        {' '}
        {/* Changed tag colors */}
        {category}
      </span>
      <h3 className="mb-2 text-lg font-semibold text-black">{title}</h3>{' '}
      {/* Changed text to black */}
      <p className="mb-4 text-sm text-black/70">By {instructor}</p>{' '}
      {/* Changed text color */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="ml-2 text-sm text-black/60">(1,234)</span>{' '}
          {/* Changed text color */}
        </div>
        <a
          href="#"
          className="font-medium text-supperagent hover:text-supperagent/90"
        >
          {' '}
          {/* Changed link color */}
          View
        </a>
      </div>
    </div>
  </div>
);

/**
 * Popular Courses Section Component
 */
const PopularCoursesSection = () => {
  const courses = [
    {
      title: 'The Complete React Developer Course',
      category: 'Web Development',
      instructor: 'Jane Doe',
      imageSrc: 'https://placehold.co/400x300/9b59b6/ffffff?text=React'
    },
    {
      title: 'Data Science A-Z: Real-Life Case Studies',
      category: 'Data Science',
      instructor: 'John Smith',
      imageSrc: 'https://placehold.co/400x300/3498db/ffffff?text=Data'
    },
    {
      title: 'Digital Marketing Masterclass',
      category: 'Marketing',
      instructor: 'Emily White',
      imageSrc: 'https://placehold.co/400x300/2ecc71/ffffff?text=Marketing'
    },
    {
      title: 'UX/UI Design Fundamentals',
      category: 'Design',
      instructor: 'Mike Brown',
      imageSrc: 'https://placehold.co/400x300/f1c40f/ffffff?text=Design'
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      {' '}
      {/* Kept bg-gray-50 for visual separation */}
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-black">
          {' '}
          {/* Changed text to black */}
          Explore Our Popular Courses
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <PrimaryButton className="!text-lg">View All Courses</PrimaryButton>
        </div>
      </div>
    </section>
  );
};

/**
 * "How it Works" Section Component
 */
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Globe className="h-8 w-8 text-supperagent" />,
      title: '1. Browse',
      description: 'Explore thousands of courses in our growing catalog.'
    },
    {
      icon: <PlayCircle className="h-8 w-8 text-supperagent" />,
      title: '2. Learn',
      description: 'Learn at your own pace with on-demand video lectures.'
    },
    {
      icon: <Brain className="h-8 w-8 text-supperagent" />,
      title: '3. Practice',
      description: 'Apply your knowledge with hands-on projects and quizzes.'
    },
    {
      icon: <Award className="h-8 w-8 text-supperagent" />,
      title: '4. Achieve',
      description: 'Earn your certificate and unlock your new future.'
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="mb-12 text-4xl font-bold text-black">
          {' '}
          {/* Changed text to black */}
          How Mentora Works
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-supperagent/10">
                {' '}
                {/* Changed icon bg */}
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-black">
                {step.title}
              </h3>{' '}
              {/* Changed text to black */}
              <p className="max-w-xs text-black/70">{step.description}</p>{' '}
              {/* Changed text color */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Testimonial Card Component
 */
const TestimonialCard = ({ quote, name, role, avatarSrc }) => (
  <div className="rounded-lg bg-white p-8 shadow-sm">
    {' '}
    {/* Changed bg to white */}
    <p className="mb-6 text-lg italic text-black/80">"{quote}"</p>{' '}
    {/* Changed text color */}
    <div className="flex items-center">
      <img
        src={avatarSrc}
        alt={name}
        className="mr-4 h-12 w-12 rounded-full object-cover"
        onError={(e) =>
          (e.currentTarget.src = 'https://placehold.co/100x100?text=Avatar')
        }
      />
      <div>
        <h4 className="font-semibold text-black">{name}</h4>{' '}
        {/* Changed text to black */}
        <p className="text-sm text-supperagent">{role}</p>{' '}
        {/* Changed text to supperagent */}
      </div>
    </div>
  </div>
);

/**
 * Testimonials Section Component
 */
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        'Mentora completely changed the trajectory of my career. The React course was practical and easy to follow.',
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      avatarSrc: 'https://placehold.co/100x100/E8117F/ffffff?text=SJ'
    },
    {
      quote:
        "As a complete beginner, I was intimidated by data science. Mentora's structured path made it accessible and fun!",
      name: 'David Kim',
      role: 'Data Analyst',
      avatarSrc: 'https://placehold.co/100x100/16A085/ffffff?text=DK'
    },
    {
      quote:
        'The community support is amazing. I connected with mentors who helped me land my first design job.',
      name: 'Maria Garcia',
      role: 'UX/UI Designer',
      avatarSrc: 'https://placehold.co/100x100/D35400/ffffff?text=MG'
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      {' '}
      {/* Changed bg for contrast */}
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-black">
          {' '}
          {/* Changed text to black */}
          Hear From Our Learners
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Call to Action (CTA) Section Component
 */
const CTASection = () => (
  <section className="bg-supperagent py-24 text-white">
    {' '}
    {/* Changed bg to supperagent */}
    <div className="container mx-auto px-6 text-center">
      <h2 className="mb-4 text-4xl font-bold">
        Ready to Start Your Learning Journey?
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-xl text-white/80">
        {' '}
        {/* Changed text color */}
        Join thousands of learners and professionals mastering new skills on
        Mentora.
      </p>
      <button
        className="transform rounded-lg bg-white px-8 py-4 text-lg font-semibold text-supperagent shadow-md transition-transform hover:scale-105 hover:bg-gray-100" // Changed button text to supperagent
      >
        Join for Free
      </button>
    </div>
  </section>
);

/**
 * Footer Component
 */
const Footer = () => (
  <footer className="bg-black py-16 text-white/70">
    {' '}
    {/* Changed bg to black and text to light gray */}
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
        {/* Logo and About */}
        <div className="col-span-2 lg:col-span-1">
          <h3 className="mb-4 text-3xl font-bold text-white">Mentora</h3>
          <p className="text-sm">
            Empowering minds through accessible, high-quality online education.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Courses
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* For Business */}
        <div>
          <h4 className="mb-4 font-semibold text-white">For Business</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Mentora for Teams
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Become an Instructor
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Partnerships
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-4 font-semibold text-white">Support</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Stay Connected */}
        <div>
          <h4 className="mb-4 font-semibold text-white">Stay Connected</h4>
          <p className="mb-2 text-sm">Get our latest news and offers.</p>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-supperagent" // Changed ring color
          />
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-white/20 pt-8 text-center text-sm">
        {' '}
        {/* Changed border color */}
        <p>&copy; {new Date().getFullYear()} Mentora. All rights reserved.</p>
      </div>
    </div>
  </footer>
);


export default function HomePage() {
  return (
    <div className="">
     
      <HeroSection />
      <FeaturesSection />
      <PopularCoursesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
