import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Award,
  Building2,
  UserCheck,
  UserPlus,
  Scale,
  Quote,
  Heart,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Data ---

const credentials = [
  'Skills for Care aligned',
  'CQC key lines of enquiry',
  'CPD accredited',
  'UK legislation current'
];

const testimonials = [
  {
    quote:
      'Our team completed the safeguarding and infection control modules during induction. The CQC inspector commented positively on the evidence of structured training during our last inspection.',
    author: 'Registered Manager, domiciliary care provider, East London'
  },
  {
    quote:
      'I have worked in care for eleven years. This is the first online training I have done that felt like it was written for someone who actually does this job.',
    author: 'Senior Care Worker, supported living service'
  }
];

const missionPoints = [
  'Develops essential knowledge for safe, competent care work',
  'Supports safer working practices across all care settings',
  'Promotes dignity, choice and independence for people in care',
  'Reflects current UK legislation and regulatory guidance',
  'Encourages professional responsibility and continuous learning'
];

const learningFeatures = [
  { icon: BookOpen, label: 'Structured chapters' },
  { icon: PlayCircle, label: 'Short explanatory videos' },
  { icon: FileText, label: 'Downloadable training manuals' },
  { icon: HelpCircle, label: 'Chapter knowledge checks' },
  { icon: ClipboardCheck, label: 'Final assessment' },
  { icon: Award, label: 'Downloadable CPD certificate' }
];

const audiences = [
  {
    icon: UserCheck,
    title: 'Individual Care Workers',
    desc: 'Building or refreshing knowledge at your own pace, around your own hours.'
  },
  {
    icon: Heart,
    title: 'New Workers Entering Care',
    desc: 'Structured foundational learning that prepares you for a safe first day and beyond.'
  },
  {
    icon: Building2,
    title: 'Care Organisations',
    desc: 'Team enrolment, completion tracking, and certification across your workforce. Enquire about organisational access.',
    link: { href: '/contact', label: 'Enquire about organisational access' }
  }
];

const Eyebrow = ({
  children,
  light = false
}: {
  children: React.ReactNode;
  light?: boolean;
}) => (
  <p
    className={`mb-3 text-xs font-bold uppercase tracking-wider ${
      light ? 'text-white/70' : 'text-supperagent'
    }`}
  >
    {children}
  </p>
);

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />

      {/* --- Hero Section --- */}
      <div className="relative pb-16 pt-20 lg:pb-24 lg:pt-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <Eyebrow>About Medicare Training</Eyebrow>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-mentora lg:text-6xl">
              Practical Training for{' '}
              <span className="text-gradient">Safer Care</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-800">
              Medicare Training was founded by people working directly in UK
              health and social care — not by e-learning developers looking for
              a market. We built this platform because we knew what good
              training needed to look like for the people delivering care on the
              ground: clear, practical, legally grounded, and accessible around
              a real working shift.
            </p>
          </div>

          {/* Hero Image Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            <div className="space-y-6 md:mt-12">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800"
                alt="Carer providing support to senior"
                className="mt-6 h-64 w-full rounded-2xl object-cover shadow-lg transition-shadow duration-500 hover:shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800"
                alt="Carer interacting with resident"
                className="h-80 w-full rounded-2xl object-cover shadow-lg transition-shadow duration-500 hover:shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <img
                src="/home2.jpeg"
                alt="One-on-one support session"
                className="h-80 w-full rounded-2xl object-cover shadow-lg transition-shadow duration-500 hover:shadow-xl"
              />
              <img
                src="/home4.jpeg"
                alt="Care worker supporting a resident"
                className="h-64 w-full rounded-2xl object-cover shadow-lg transition-shadow duration-500 hover:shadow-xl"
              />
            </div>
            <div className="space-y-6 md:mt-12">
              <img
                src="/home1.jpeg"
                alt="Care worker talking with an older man"
                className="h-64 w-full rounded-2xl object-cover shadow-lg transition-shadow duration-500 hover:shadow-xl"
              />
              {/* Highlight card */}
              <div className="relative flex h-80 flex-col justify-center overflow-hidden rounded-2xl bg-mentora p-8 text-white shadow-lg">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Heart size={100} />
                </div>
                <p className="text-xl font-medium leading-relaxed">
                  Every course on this platform reflects that origin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Our Purpose --- */}
      <div className="relative border-y border-slate-100 bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <Eyebrow>Our Purpose</Eyebrow>
              <h2 className="mb-6 text-4xl font-bold text-mentora">
                Why Medicare Training Exists
              </h2>
              <div className="space-y-6 leading-relaxed text-gray-800">
                <p>
                  Care workers carry significant responsibility. They work in
                  complex, often high-pressure environments where the quality of
                  their knowledge directly affects the safety and dignity of the
                  people they support. Too much training available in the sector
                  is either too generic to be useful or too academic to be
                  retained.
                </p>
                <p>
                  Medicare Training exists to close that gap — providing
                  structured online learning that care workers can actually use,
                  built around the situations they face every day, from
                  safeguarding and infection control through to epilepsy care and
                  autism awareness.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rotate-3 scale-105 transform rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 opacity-50 blur-lg" />
              <img
                src="/home3.jpeg"
                alt="Care workers practising moving and handling"
                className="relative h-96 w-full rounded-2xl border border-white/20 object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Our Credentials --- */}
      <div className="relative bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Our Credentials</Eyebrow>
            <h2 className="mb-6 text-4xl font-bold text-mentora">
              Built to a Standard You Can Defend
            </h2>
            <p className="leading-relaxed text-gray-800">
              Every course is developed with reference to the Health and Social
              Care Act 2008, the Care Act 2014, the Mental Capacity Act 2005, and
              guidance from Skills for Care, the CQC, and the Department of
              Health and Social Care. Content is reviewed regularly against
              updated legislation and CQC key lines of enquiry to ensure it
              remains current and inspection-ready.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <ShieldCheck className="shrink-0 text-supperagent" size={20} />
                <span className="text-sm font-semibold text-mentora">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Our Promise (statement band) --- */}
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-mentora">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-supperagent/30 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[100px]" />
        </div>
        <div className="container relative z-10 mx-auto max-w-3xl px-6 text-center">
          <Eyebrow light>Our Promise</Eyebrow>
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
            Committed to Better Knowledge
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-white/90">
            Training that is easy to access but difficult to retain serves
            nobody. Our courses are built around clarity first — plain UK
            English, manageable chapters, real workplace scenarios, and
            assessments that confirm understanding rather than reward guessing.
          </p>
          <p className="text-xl font-medium leading-relaxed text-white lg:text-2xl">
            Learners who complete a Medicare Training course leave with
            knowledge they can apply the same day.
          </p>
        </div>
      </div>

      {/* --- What Learners and Managers Say --- */}
      <div className="relative bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-mentora">
              What Learners and Managers Say
            </h2>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
            {testimonials.map(({ quote, author }) => (
              <figure
                key={author}
                className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-8"
              >
                <Quote className="mb-4 rotate-180 text-supperagent" size={28} />
                <blockquote className="mb-6 flex-1 text-lg leading-relaxed text-slate-800">
                  “{quote}”
                </blockquote>
                <figcaption className="text-sm font-semibold text-mentora">
                  — {author}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* --- Our Mission --- */}
      <div className="relative border-y border-slate-100 bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Eyebrow>Our Mission</Eyebrow>
            <h2 className="mb-4 text-4xl font-bold text-mentora">
              What We Are Here to Do
            </h2>
            <p className="leading-relaxed text-gray-800">
              To provide care workers and organisations with practical online
              training that makes a genuine difference to the quality and safety
              of care delivered — and that holds up when it matters most.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {missionPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-5"
              >
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-supperagent"
                  size={20}
                />
                <span className="text-sm font-medium leading-relaxed text-slate-700">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Learning Format --- */}
      <div className="relative bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Eyebrow>Learning Format</Eyebrow>
            <h2 className="mb-4 text-4xl font-bold text-mentora">
              Built for the Reality of Care Work
            </h2>
            <p className="leading-relaxed text-gray-800">
              Our courses are designed around how care workers actually learn —
              in short windows, often between shifts, sometimes on a phone. Every
              course is divided into structured chapters, supported by short
              explanatory videos, downloadable training manuals, chapter
              knowledge checks and a final assessment. Completion generates a
              downloadable CPD certificate suitable for staff records and CQC
              evidence files.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learningFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-supperagent/10">
                  <Icon className="text-supperagent" size={20} />
                </div>
                <p className="text-sm font-semibold leading-relaxed text-mentora">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Who We Support --- */}
      <div className="relative border-y border-slate-100 bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-mentora">Who We Support</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {audiences.map(({ icon: Icon, title, desc, link }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-supperagent/10">
                  <Icon className="text-supperagent" size={22} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-mentora">{title}</h3>
                <p className="flex-1 leading-relaxed text-gray-800">{desc}</p>
                {link && (
                  <a
                    href={link.href}
                    className="group mt-6 inline-flex w-fit items-center gap-2 font-semibold text-supperagent"
                  >
                    {link.label}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- A Note on Competency --- */}
      <div className="relative bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 -rotate-3 scale-105 transform rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 opacity-50 blur-lg" />
              <img
                src="/support2.jpeg"
                alt="Supervised practical training in a care setting"
                className="relative h-96 w-full rounded-2xl border border-white/20 object-cover shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-supperagent/10">
                <Scale className="text-supperagent" size={22} />
              </div>
              <h2 className="mb-6 text-4xl font-bold text-mentora">
                A Note on Competency
              </h2>
              <div className="space-y-6 leading-relaxed text-gray-800">
                <p>
                  Online learning develops knowledge and understanding. Some care
                  activities also require supervised practical experience and
                  workplace assessment before a worker should be considered
                  competent to act.
                </p>
                <p>
                  Care providers remain responsible for assessing practical
                  competency in line with their regulatory obligations, relevant
                  legislation, and organisational policy.
                </p>
                <p className="flex items-start gap-2 font-semibold text-mentora">
                  <Info className="mt-1 shrink-0 text-supperagent" size={18} />
                  Medicare Training supports that process — it does not replace
                  it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CTA --- */}
      <section className="relative overflow-hidden bg-white py-16">
        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-supperagent/10 via-white to-teal-50/80 p-8 shadow-xl md:p-14 lg:p-16"
          >
            <motion.div
              className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-supperagent/20 blur-3xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
            />

            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
              <h2 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-mentora sm:text-5xl lg:text-6xl">
                Learn with{' '}
                <span className="text-supperagent">Medicare Training</span>
              </h2>

              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Develop the knowledge that supports safer practice, better care
                and professional growth.
              </p>

              <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
                <a
                  href="/courses"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-supperagent px-8 text-base font-semibold text-white shadow-lg shadow-supperagent/30 transition-all duration-300 hover:scale-[1.02] hover:bg-supperagent/90 sm:w-auto"
                >
                  Browse All Courses
                  <ArrowRight className="h-5 w-5" />
                </a>

                <a
                  href="/contact"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:text-supperagent sm:w-auto"
                >
                  <UserPlus className="h-5 w-5" />
                  Enquire for Organisations
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
