import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.current) {
      const SERVICE_ID = 'service_qthccjo';
      const TEMPLATE_ID = 'template_72zymql';
      const PUBLIC_KEY = 'cvDC9q5Cvk7cbGNFN';

      emailjs
        .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
        .then((result) => {
          console.log('Email sent successfully!', result.text);
          alert('Your message has been sent successfully!');
          form.current?.reset();
        })
        .catch((error) => {
          console.error('Error sending email:', error.text);
          alert('Failed to send message. Please try again later.');
        });
    } else {
      console.error('Form reference is not available.');
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative flex items-center justify-center py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/Convention.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-0 max-w-4xl w-full flex overflow-hidden">
              {/* Contact Form */}
              <div className="flex-1 p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

                <form ref={form} onSubmit={sendEmail} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full border-gray-200"
                    name="user_name"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border-gray-200"
                    name="user_email"
                    required
                  />
                  <Textarea
                    placeholder="Enter your message here..."
                    rows={4}
                    className="w-full resize-none border-gray-200"
                    name="message"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                  >
                    Send
                  </Button>
                </form>
              </div>

              {/* Contact Information Card */}
              <div className="flex-1 bg-gray-900 text-white p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Phone:</p>
                      <p className="font-medium">+250 784 526984</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Email:</p>
                      <p className="font-medium">info@rwandamart.shop</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Times:</p>
                      <p className="font-medium">Mon - Sun: 7 AM - 9 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Location:</p>
                      <p className="font-medium">Downtown House Kigali</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
