import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const TermsOfService: React.FC = () => {
  return (
    <>
      <title>Terms of Service - TrendiTools</title>
      <meta name="description" content="Terms of Service for TrendiTools - Read our terms and conditions for using our digital tools discovery platform." />
      
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg border p-4">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">Terms of Service</h1>
            
            <div className="space-y-6">
              <p className="text-muted-foreground">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using TrendiTools, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  TrendiTools is a digital platform that helps users discover, explore, and bookmark 
                  digital tools and services. I provide search functionality, AI-powered recommendations, 
                  and curated tool collections.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground mb-3">
                  To access certain features, you may need to create an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and current information</li>
                  <li>Notifying me of any unauthorized use of your account</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
                <p className="text-muted-foreground mb-3">
                  You agree not to use the service to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to scrape or harvest data</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The service and its original content, features, and functionality are owned by 
                  TrendiTools and are protected by international copyright, trademark, patent, 
                  trade secret, and other intellectual property laws.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Third-Party Tools</h2>
                <p className="text-muted-foreground">
                  Our platform provides information about third-party tools and services. We do not 
                  endorse, warrant, or guarantee these tools. Your use of third-party tools is 
                  subject to their respective terms and conditions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  The service is provided "as is" without any warranties, express or implied. 
                  We do not warrant that the service will be uninterrupted, error-free, or 
                  completely secure.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall TrendiTools be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising out of your use of the service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice, for conduct that we believe violates these Terms of Service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of 
                  any material changes via email or through the service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Information</h2>
                <p className="text-muted-foreground mb-3">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:contact@trenditools.com" className="text-primary hover:text-primary/80 underline">contact@trenditools.com</a>
                </p>
              </section>
            </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;