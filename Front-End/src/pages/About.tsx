import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const AboutUs = () => {
  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen flex flex-col">
      {/* Header/Nav*/}
      <Header/>

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* About Us Title */}
        <section className="py-16 text-center">
          <h1 className="text-4xl font-normal text-gray-800 tracking-wider">
            About Us
          </h1>
        </section>

        {/* Our Story Section */}
        {/* Changed max-w-5xl to max-w-7xl for increased width, and px-4 to px-2 for reduced horizontal padding */}
        <section className="container mx-auto px-2 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <img
                src="/Gentil.jpg" // Replace with the actual path to your image
                alt="Smiling woman"
                className="w-full h-auto max-w-xs md:max-w-none rounded-lg shadow-lg object-cover"
                style={{ borderRadius: '8px' }} // Exact match for border-radius
              />
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-3xl font-semibold mb-4 text-gray-800">Our Story</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Founded in the heart of Kigali, <span className="font-semibold text-purple-600">wXc</span>, WomXchange was born from a simple but powerful
                idea: to create an online marketplace where Rwandan women would showcase, sell, and grow their
                businesses on their own terms. What began as individual idea now has become initiative among wone
                entrepreneurs and it has blossomed into Rwanda's premier e-commerce platform dedicated to elevating
                women entrepreneurs across every Kigali.
              </p>
            </div>
          </div>
        </section>

        {/* Mission and Vision Section */}
        <section className="bg-gray-50 py-12">
          {/* Changed max-w-5xl to max-w-7xl for increased width, and px-4 to px-2 for reduced horizontal padding */}
          <div className="container mx-auto px-2 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Mission */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center md:text-left">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Mission</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Founded in the heart of Kigali, <span className="font-semibold text-purple-600">wXc</span>, WomenXchange was born from a simple but powerful idea to create
                an online marketplace where Rwandan women could showcase, sell, and grow their businesses on their
                own terms. What began as individual idea now has become initiative among women entrepreneurs and it
                has blossomed into Rwanda's premier e-commerce platform dedicated to elevating women
                entrepreneurs across every Kigali.
              </p>
            </div>
            {/* Vision */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center md:text-left">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Vision</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Founded in the heart of Kigali, <span className="font-semibold text-purple-600">wXc</span>, WomenXchange was born from a simple but powerful idea to create
                an online marketplace where Rwandan women could showcase, sell, and grow their businesses on their
                own terms. What began as individual idea now has become initiative among women entrepreneurs and it
                has blossomed into Rwanda's premier e-commerce platform dedicated to elevating women
                entrepreneurs across every Kigali.
              </p>
            </div>
          </div>
        </section>

        {/* Image Gallery Section */}
        {/* Changed max-w-5xl to max-w-7xl for increased width, and px-4 to px-2 for reduced horizontal padding */}
        <section className="container mx-auto px-2 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center items-center">
              <img
                src="/Hero.jpg" // Replace with the actual path to your image
                alt="Various products"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/Hero.jpg" // Replace with the actual path to your image
                alt="Rwanda logo"
                className="h-auto max-h-48 w-auto rounded-lg shadow-md object-contain"
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-center items-center">
              <img
                src="/Hero.jpg" // Replace with the actual path to your image
                alt="Woman with clothes"
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
          </div>
        </section>

        {/* Contact Us Button Section */}
        <section className="py-16 text-center">
          <Link to="/contact">
            <button className="bg-purple-600 text-white py-3 px-10 rounded-full text-lg font-medium hover:bg-purple-700 transition-colors shadow-lg">
              Contact Us
            </button>
          </Link>
        </section>
      </main>

      {/* Footer Section */}
     <Footer/>
    </div>
  );
};

export default AboutUs;