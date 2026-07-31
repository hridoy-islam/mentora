import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageSquare,
  User,
  Building2,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      await axiosInstance.post('/contact', { name, email, subject, message });
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/2 rounded-full bg-purple-100/40 blur-3xl" />

      <header className="relative z-10 pb-12 pt-20 text-center lg:pb-16 lg:pt-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-supperagent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-supperagent">
              <MessageSquare className="h-3 w-3" />
              Contact Us
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-mentora md:text-5xl lg:text-6xl">
              Let's Start a <span className="text-gradient">Conversation</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
              Have questions about our courses or enterprise solutions? We're
              here to help you achieve your learning goals.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 pb-24">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8 lg:col-span-5"
          >
            Fill out the form below and we'll get back to you shortly.
            <div>
              <h3 className="mb-6 text-2xl font-bold text-mentora">
                Get in Touch
              </h3>
              <p className="mb-8 text-gray-500">
                Our support team is always ready to answer your questions. We
                usually respond within 24 hours on business days.
              </p>
            </div>
            <div className="space-y-4">
              <div className="group flex items-start rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex-shrink-0 rounded-xl bg-blue-50 p-3 text-supperagent transition-transform duration-300 group-hover:scale-110">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="ml-5">
                  <h4 className="mb-1 text-lg font-semibold text-mentora">
                    Chat to support
                  </h4>
                  <p className="mb-2 text-sm text-gray-500">
                    We're here to help.
                  </p>
                  <a
                                        href="mailto:support@medicaretraining.co.uk"
                    className="font-medium text-supperagent hover:underline"
                  >
                    support@medicaretraining.co.uk {' '}
                  </a>
                </div>
              </div>

              <div className="group flex items-start rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex-shrink-0 rounded-xl bg-purple-50 p-3 text-purple-600 transition-transform duration-300 group-hover:scale-110">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="ml-5">
                  <h4 className="mb-1 text-lg font-semibold text-mentora">
                    Visit us
                  </h4>
                  <p className="mb-2 text-sm text-gray-500">
                    Visit our office.
                  </p>
                  <p className="font-medium leading-tight text-gray-700">
                    Mardyke Works, St. Marys Ln,
                    <br />
                    Upminster RM14 3PA
                  </p>
                </div>
              </div>

              <div className="group flex items-start rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex-shrink-0 rounded-xl bg-green-50 p-3 text-green-600 transition-transform duration-300 group-hover:scale-110">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="ml-5">
                  <h4 className="mb-1 text-lg font-semibold text-mentora">
                    Call us
                  </h4>
                  
                  <a
                    href="tel:07914829155"
                    className="font-medium text-supperagent hover:underline"
                  >
                    07914829155
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 md:p-10">
              <div className="bg-gradient-primary absolute left-0 right-0 top-0 h-1.5" />

              <h3 className="mb-2 text-2xl font-bold text-mentora">
                Send us a Message
              </h3>
              <p className="mb-8 text-gray-500">
                Fill out the form below and we'll get back to you shortly.
              </p>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                  <h4 className="mb-2 text-xl font-bold text-green-800">Message Sent!</h4>
                  <p className="mb-6 text-green-700">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setStatus('idle')}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="full-name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="full-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="h-12 border-gray-200 bg-gray-50 pl-10 transition-all focus:border-supperagent focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="h-12 border-gray-200 bg-gray-50 pl-10 transition-all focus:border-supperagent focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Subject
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="How can we help you?"
                        className="h-12 border-gray-200 bg-gray-50 pl-10 transition-all focus:border-supperagent focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your requirements..."
                      className="min-h-[150px] resize-none border-gray-200 bg-gray-50 p-4 transition-all focus:border-supperagent focus:bg-white"
                      required
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="h-12 w-full rounded-xl bg-supperagent text-lg font-semibold text-white shadow-lg shadow-supperagent/25 transition-all duration-300 hover:bg-supperagent/90 hover:shadow-supperagent/40 disabled:opacity-60"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
