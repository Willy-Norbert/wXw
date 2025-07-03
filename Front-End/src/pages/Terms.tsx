
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/register" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Registration
        </Link>

        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Rwanda Marketplace ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily use the Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the Platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Products and Services</h2>
            <p className="mb-4">
              All products and services are subject to availability. We reserve the right to discontinue any product or service at any time. Prices for products are subject to change without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="mb-4">
              Payment is required at the time of purchase. We accept various payment methods including credit cards and mobile money. All transactions are processed securely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibond mb-4">6. Privacy Policy</h2>
            <p className="mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
            <p className="mb-4">You may not use our Platform:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Rwanda Marketplace or its suppliers be liable for any damages arising out of the use or inability to use the materials on the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to revise these terms of service at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms and Conditions, please contact us at support@rwandamarketplace.com
            </p>
          </section>

          <div className="text-sm text-gray-600 mt-12">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
