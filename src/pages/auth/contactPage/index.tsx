import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Phone, Mail, MapPin, Building } from 'lucide-react';

export function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! (Demo)');
  };

  return (
    <div className="">
      <header className="border-b  bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto">
          <h1 className="flex items-center gap-3 text-4xl font-bold text-gray-900 dark:text-white">
            <Building className="h-10 w-10 text-supperagent" />
            Get in Touch
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            We'd love to hear from you. Please fill out the form below or use
            our contact details.
          </p>
        </div>
      </header>

      <main className="container  mx-auto py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form and our team will get back to you within 24
                hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="John" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Course Inquiry"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <h2 className="text-3xl font-semibold ">Contact Information</h2>
            <p className="text-lg">
              You can also reach us directly through the following channels.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0  rounded-full p-3">
                  <Mail className="h-6 w-6 text-supperagent" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    General Inquiries
                  </p>
                  <a
                    href="mailto:support@mentora.com"
                    className="text-supperagent hover:underline"
                  >
                    support@mentora.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0  rounded-full p-3">
                  <Phone className="h-6 w-6 text-supperagent" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monday - Friday, 9am-5pm
                  </p>
                  <a
                    href="tel:+1234567890"
                    className="text-supperagent  hover:underline"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full  bg-blue-100 p-3">
                  <MapPin className="h-6 w-6 text-supperagent " />
                </div>
                <div>
                  <h3 className="text-xl font-medium ">Office</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    123 Education Lane
                    <br />
                    Knowledge City, CA 94016
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
