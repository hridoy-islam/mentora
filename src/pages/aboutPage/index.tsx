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
  ShieldCheck,
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Building2,
  UserCheck,
  Mail,
  Phone,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Data ---

const missionPoints = [
  'Develops essential knowledge',
  'Supports safer working practices',
  'Promotes dignity, choice and independence',
  'Reflects relevant UK legislation and guidance',
  'Encourages professional responsibility',
  'Supports continuous learning and development',
];

const learningFeatures = [
  { icon: BookOpen, label: 'Structured learning chapters' },
  { icon: PlayCircle, label: 'Short explanatory videos' },
  { icon: Users, label: 'Practical care-based examples' },
  { icon: FileText, label: 'Downloadable training manuals' },
  { icon: HelpCircle, label: 'Chapter knowledge questions' },
  { icon: ClipboardCheck, label: 'Final course assessments' },
  { icon: Award, label: 'Certificates of successful completion' },
];

const principles = [
  {
    icon: Target,
    title: 'Relevant',
    desc: 'Courses focus on situations and responsibilities care workers may encounter in practice.',
  },
  {
    icon: Globe,
    title: 'Accessible',
    desc: 'Content is presented through manageable chapters, clear explanations and supporting learning resources.',
  },
  {
    icon: Heart,
    title: 'Person-Centred',
    desc: 'Training reinforces dignity, privacy, consent, choice and independence.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible',
    desc: 'Learners are reminded to work within their role, training, competence and authorisation.',
  },
  {
    icon: CheckCircle2,
    title: 'Current',
    desc: 'Course content is reviewed against relevant UK legislation, national guidance and recognised care practice.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* --- Hero Section --- */}
      <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>About Us</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-mentora tracking-tight mb-6 leading-tight">
              About <span className="text-gradient">Medicare Training</span>
            </h1>
            <p className="text-lg text-gray-800 leading-relaxed max-w-2xl mx-auto">
              Practical online training that strengthens care-worker knowledge and supports safer, more person-centred care.
            </p>
          </div>

          {/* Hero Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="space-y-6 md:mt-12">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800"
                alt="Carer providing support to senior"
                className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500 mt-6"
              />
              <img
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800"
                alt="Carer interacting with resident"
                className="w-full h-80 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
            </div>
            <div className="space-y-6">
              <img
                src="/home2.jpeg"
                alt="One-on-one support session"
                className="w-full h-80 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
              <img
                src="/home4.jpeg"
                alt="Healthcare professional studying online"
                className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
            </div>
            <div className="space-y-6 md:mt-12">
              <img
                src="/home1.jpeg"
                alt="Health team workshop discussion"
                className="w-full h-64 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500"
              />
              {/* Highlight card */}
              <div className="h-80 bg-mentora rounded-2xl p-8 flex flex-col justify-center text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart size={100} />
                </div>
                <Sparkles className="text-indigo-400 mb-4" size={32} />
                <p className="text-xl font-medium leading-relaxed">
                  We combine clear course content with a straightforward online learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Our Purpose & Our Promise --- */}
      <div className="relative bg-white py-16 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-mentora mb-6">Our Purpose</h2>
              <div className="space-y-6 text-gray-800 leading-relaxed">
                <p>
                  Medicare Training provides accessible online learning for individuals and organisations across the UK health and social care sector.
                </p>
                <p>
                  We combine clear course content with a straightforward online learning experience. Care workers can develop essential knowledge through structured chapters, short videos, downloadable manuals and assessments based on realistic care situations.
                </p>
              </div>

              <h2 className="text-4xl font-bold text-mentora mt-12 mb-6">Our Promise</h2>
              <div className="space-y-6 text-gray-800 leading-relaxed">
                <p>
                  We are committed to making important care knowledge easier to understand, remember and apply.
                </p>
                <p>
                  Our courses focus on the responsibilities care workers face in practice, including protecting people from harm, respecting individual rights, working within competence and reporting concerns appropriately.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-2xl transform rotate-3 scale-105 blur-lg opacity-50" />
              <img
                src="/home4.jpeg"
                alt="Healthcare professionals meeting"
                className="relative rounded-2xl shadow-2xl border border-white/20 w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Our Vision (statement band) --- */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mentora">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-supperagent/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} />
            <span>Our Vision</span>
          </div>
          <p className="text-2xl lg:text-4xl font-medium text-white leading-relaxed">
            To contribute to safer, more compassionate and person-centred care through accessible, high-quality learning.
          </p>
        </div>
      </div>

      {/* --- Our Mission --- */}
      <div className="py-16 relative bg-white">
        <div className="container mx-auto ">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-mentora mb-4">Our Mission</h2>
            <p className="text-gray-800">
              To provide care workers and organisations with practical online training that:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {missionPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-50 p-5 rounded-xl border border-slate-100"
              >
                <CheckCircle2 className="text-supperagent shrink-0 mt-0.5" size={20} />
                <span className="text-slate-700 font-medium text-sm leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Learning Built for Care Workers --- */}
      <div className="py-16 relative bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-4xl font-bold text-mentora mb-4">Learning Built for Care Workers</h2>
            <p className="text-gray-800">
              Our courses are designed around the working realities of adult social care. Information is presented in clear UK English without unnecessary complexity.
            </p>
          </div>
          <p className="text-center text-gray-800 font-semibold text-sm uppercase tracking-wider mb-12">
            Depending on the course, learners may access:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningFeatures.map(({ icon: Icon, label }, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-supperagent/10 flex items-center justify-center mb-4">
                  <Icon className="text-supperagent" size={20} />
                </div>
                <p className="text-sm font-semibold text-mentora leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Training for Individuals / Organisations --- */}
      <div className="py-16 relative bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Individuals */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=900"
                alt="Care worker studying online"
                className="w-full h-56 object-cover"
              />
              <div className="p-8 flex flex-col flex-1">
                <div className="w-11 h-11 rounded-lg bg-supperagent/10 flex items-center justify-center mb-5">
                  <UserCheck className="text-supperagent" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-mentora mb-3">Training for Individuals</h3>
                <p className="text-gray-800 leading-relaxed mb-8 flex-1">
                  Whether you are starting a career in care or refreshing your existing knowledge, Medicare Training allows you to study online at a suitable time and pace. Explore subjects including medicines, first aid, food hygiene, safeguarding, infection prevention, dementia care, health and safety and person-centred practice.
                </p>
                <a
                  href="/courses"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-mentora text-white font-bold rounded-full hover:opacity-90 transition-opacity w-fit"
                >
                  Explore Courses
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Organisations */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=900"
                alt="Care organisation team workshop"
                className="w-full h-56 object-cover"
              />
              <div className="p-8 flex flex-col flex-1">
                <div className="w-11 h-11 rounded-lg bg-supperagent/10 flex items-center justify-center mb-5">
                  <Building2 className="text-supperagent" size={22} />
                </div>
                <h3 className="text-2xl font-bold text-mentora mb-3">Training for Organisations</h3>
                <p className="text-gray-800 leading-relaxed mb-8 flex-1">
                  We help care providers deliver essential online learning across their workforce. Organisations can contact us to discuss their number of learners, required subjects and suitable training arrangements.
                </p>
                <a
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-mentora text-mentora font-bold rounded-full hover:bg-mentora hover:text-white transition-colors w-fit"
                >
                  Enquire About Organisational Training
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Our Training Principles --- */}
      <div className="py-16 relative bg-slate-50">
        <div className="container mx-auto ">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-mentora mb-4">Our Training Principles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-supperagent/10 flex items-center justify-center mb-5">
                  <Icon className="text-supperagent" size={22} />
                </div>
                <h3 className="text-base font-bold text-mentora mb-2">{title}</h3>
                <p className="text-gray-800 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Supporting Knowledge and Competence --- */}
      <div className="relative bg-white py-16 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-2xl transform -rotate-3 scale-105 blur-lg opacity-50" />
              <img
                src="/support2.jpeg"
                alt="Supervised practical training in a care setting"
                className="relative rounded-2xl shadow-2xl border border-white/20 w-full h-96 object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-mentora mb-6">Supporting Knowledge and Competence</h2>
              <div className="space-y-6 text-gray-800 leading-relaxed">
                <p>
                  Online learning provides essential knowledge, but some care activities also require workplace instruction, supervised practice and practical competency assessment.
                </p>
                <p>
                  Care providers remain responsible for deciding whether workers are competent and authorised to undertake specific duties independently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
<section className="py-16 relative overflow-hidden bg-white">
      {/* Background Micro Dots & Ambient Glows */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl bg-gradient-to-br from-supperagent/10 via-white to-teal-50/80 p-8 md:p-14 lg:p-16"
        >
          {/* Animated Background Fluid Light Blobs */}
          <motion.div
            className="absolute -top-24 -right-24 w-96 h-96 bg-supperagent/20 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* Full Width Centered Content */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-supperagent" />
              <span>Get Started Today</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-mentora tracking-tight leading-[1.1] mb-6">
              Learn with <span className="text-supperagent">Medicare Training</span>
            </h2>

            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              Develop the knowledge that supports safer practice, better care, and professional growth across all adult care settings.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <a
                href="/courses"
                className="w-full sm:w-auto bg-supperagent text-white font-semibold h-14 px-8 text-base shadow-lg shadow-supperagent/30 hover:bg-supperagent/90 hover:scale-[1.02] transition-all duration-300 rounded-full flex items-center justify-center gap-2"
              >
                Browse All Courses
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/contact"
                className="w-full sm:w-auto bg-white text-slate-700 font-semibold h-14 px-8 text-base border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-supperagent transition-all duration-300 rounded-full shadow-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  );
}