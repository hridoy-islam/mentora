import React from 'react';
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
  Clock
} from 'lucide-react';

export function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate loading state or API call here
    alert('Message sent successfully!');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      
      {/* Gradient Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

      {/* --- Header Section --- */}
      <header className="relative pt-20 pb-12 lg:pt-24 lg:pb-16 text-center z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-6">
                <MessageSquare className="w-3 h-3" />
                Contact Us
              </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-mentora tracking-tight mb-6">
              Let's Start a <span className="text-gradient">Conversation</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Have questions about our courses or enterprise solutions? We're here to help you achieve your learning goals.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 pb-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* --- Left Column: Contact Info --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >Fill out the form below and we'll get back to you shortly.
            <div>
              <h3 className="text-2xl font-bold text-mentora mb-6">Get in Touch</h3>
              <p className="text-gray-500 mb-8">
                Our support team is always ready to answer your questions. 
                We usually respond within 24 hours on business days.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <div className="group flex items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 p-3 bg-blue-50 text-supperagent rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h4 className="text-lg font-semibold text-mentora mb-1">Chat to support</h4>
                  <p className="text-sm text-gray-500 mb-2">We're here to help.</p>
                  <a href="mailto:support@medicare.com" className="text-supperagent font-medium hover:underline">
                    support@medicare.com
                  </a>
                </div>
              </div>

              {/* Office Card */}
              <div className="group flex items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h4 className="text-lg font-semibold text-mentora mb-1">Visit us</h4>
                  <p className="text-sm text-gray-500 mb-2">Visit our office HQ.</p>
                  <p className="text-gray-700 font-medium leading-tight">
                    123 Knowledge City,<br />
                    San Francisco, CA 94103
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group flex items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="ml-5">
                  <h4 className="text-lg font-semibold text-mentora mb-1">Call us</h4>
                  <p className="text-sm text-gray-500 mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15550000000" className="text-supperagent font-medium hover:underline">
                    +1 (555) 000-0000
                  </a>
                </div>
              </div>
            </div>

           
          </motion.div>

          {/* --- Right Column: Form --- */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="lg:col-span-7"
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-primary" />
                
                <h3 className="text-2xl font-bold text-mentora mb-2">Send us a Message</h3>
                <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you shortly.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="full-name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input 
                                    id="full-name" 
                                    placeholder="John Doe" 
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-supperagent transition-all" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-supperagent transition-all" 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</Label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input 
                                id="subject" 
                                placeholder="How can we help you?" 
                                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-supperagent transition-all" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</Label>
                        <Textarea 
                            id="message" 
                            placeholder="Tell us about your requirements..." 
                            className="min-h-[150px] p-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-supperagent transition-all resize-none" 
                            required 
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 bg-supperagent hover:bg-supperagent/90 text-white font-semibold text-lg shadow-lg shadow-supperagent/25 hover:shadow-supperagent/40 transition-all duration-300 rounded-xl"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                    </Button>
                </form>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}