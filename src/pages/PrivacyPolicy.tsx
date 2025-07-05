import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - TrendiTools</title>
        <meta name="description" content="Privacy Policy for TrendiTools - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg border p-4">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">Privacy Policy</h1>
            
            <div className="max-w-none space-y-6">
              <p className="text-muted-foreground">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us. This may include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Email address and account credentials</li>
                  <li>Tool bookmarks and preferences</li>
                  <li>Chat interactions with our AI assistant</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Communicate with you about our services</li>
                  <li>Analyze usage patterns to enhance functionality</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
                <p className="text-muted-foreground mb-3">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy. We may share information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and provide personalized content. You can control cookie settings through your browser.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
                <p className="text-muted-foreground mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of certain communications</li>
                  <li>Request data portability</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;