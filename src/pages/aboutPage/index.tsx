import React from 'react';
import { 
  Users, 
  Target, 
  Globe, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function AboutPage() {
  return (
    // KEPT: Original Indigo selection theme
    <div className="relative min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* KEPT: Original Indigo Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>

      {/* KEPT: Original Ambient Blobs (Blue/Purple) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />


      {/* --- Hero Section --- */}
      <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            {/* KEPT: Original Indigo Badge style */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>The Future of Care Education</span>
            </div>
            {/* KEPT: Original Headline styles and gradients */}
            <h1 className="text-4xl lg:text-6xl font-extrabold text-mentora tracking-tight mb-6 leading-tight">
              A global marketplace for <span className="text-gradient">learning and teaching.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Medicare Training is the premier destination for online courses. We empower experts to sell their knowledge and help millions of students unlock their potential through affordable, high-quality education in the health and social care sectors.
            </p>
          </div>

          {/* Hero Image Grid (Masonry feel) - UPDATED IMAGES to Health Theme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="space-y-6 md:mt-12">
              {/* New Image 1: CPR Training */}
              <img
  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800"
  alt="Carer providing support to senior"
  className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500 mt-6"
/>
              {/* New Image 2: Care Home Interaction */}
              <img 
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800" 
                alt="Carer interacting with resident" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
            </div>
            <div className="space-y-6">
              {/* New Image 3: Support Session/Counseling */}
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" 
                alt="One-on-one support session" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
              {/* New Image 4: Digital Learning in Healthcare */}
              <img 
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800" 
                alt="Healthcare professional studying online" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
            </div>
            <div className="space-y-6 md:mt-12">
              {/* New Image 5: Group Workshop */}
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" 
                alt="Health team workshop discussion" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
              {/* Stat Card - KEPT Original Indigo/Dark Theme */}
              <div className="h-80 bg-mentora rounded-2xl p-8 flex flex-col justify-center text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <TrendingUp size={100} />
                </div>
                <span className="text-5xl font-bold text-indigo-400 mb-2">2.5M+</span>
                <span className="text-xl font-medium">Courses sold globally.</span>
                <p className="mt-4 text-slate-400 text-sm">Join the fastest growing economy of knowledge creators.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mission Section --- */}
      <div className="relative bg-white py-24 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Content */}
            <div>
              <h2 className="text-3xl font-bold text-mentora mb-6">
                We're building the infrastructure for the knowledge economy.
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>
                  Medicare Training isn't just a platform; it's a launchpad. We provide the tools for professionals to digitize their expertise and sell it to a global audience.
                </p>
                <p>
                  For learners, we are the trusted source for career advancement. Whether you are looking to break into tech, master a craft, or learn a language, Medicare Training connects you with the right course at the right price.
                </p>
              </div>

              {/* KEPT: Original Indigo/Purple Stats boxes */}
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-supperagent/10 border border-indigo-100">
                  <h3 className="text-3xl font-bold text-gradient mb-1">85%</h3>
                  <p className="text-sm text-slate-700 font-medium">Of graduates report career benefits</p>
                </div>
                <div className="p-5 rounded-xl bg-supperagent/10 border border-purple-100">
                  <h3 className="text-3xl font-bold text-gradient mb-1">$15M+</h3>
                  <p className="text-sm text-slate-700 font-medium">Paid to instructors last year</p>
                </div>
              </div>
            </div>

            {/* Visual - UPDATED IMAGE to Health Theme */}
            <div className="relative">
              {/* KEPT: Original Indigo/Purple Gradient Blur */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-2xl transform rotate-3 scale-105 blur-lg opacity-50"></div>
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                alt="Healthcare professionals meeting" 
                className="relative rounded-2xl shadow-2xl border border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Values / Why Choose Us --- */}
      <div className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-mentora mb-4">Why the world chooses Medicare Training</h2>
            <p className="text-slate-600">
              We define our success by the success of our instructors and the growth of our students.
            </p>
          </div>

          {/* KEPT: Original Icon Colors (Blue, Emerald, Purple, Rose) - These fit okay. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShieldCheck className="text-blue-600" size={24} />,
                title: "Quality Vetted",
                desc: "Every course on Medicare Training passes a strict quality review process to ensure high standards."
              },
              {
                icon: <Target className="text-emerald-600" size={24} />,
                title: "Practical Skills",
                desc: "We prioritize courses that teach job-ready skills over abstract theory."
              },
              {
                icon: <Globe className="text-purple-600" size={24} />,
                title: "Global Reach",
                desc: "Instructors can sell to students in 100+ countries with automatic currency conversion."
              },
              {
                icon: <Heart className="text-rose-600" size={24} />,
                title: "Student Success",
                desc: "30-day money-back guarantee on all courses. We stand behind our marketplace."
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-mentora mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CTA Section --- */}
      <div className="py-24 relative overflow-hidden">
        {/* KEPT: Original Dark Indigo/Purple Background Aesthetic */}
        <div className="absolute inset-0 bg-slate-900">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-supperagent/60 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-supperagent/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to start learning?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Join millions of learners on Medicare Training today. Or sign up as an instructor and start selling your course to the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors shadow-xl">
              Browse Courses
            </button>
            <button className="px-8 py-4 bg-transparent border border-slate-600 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
              Become an Instructor
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}