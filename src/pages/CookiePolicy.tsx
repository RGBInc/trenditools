import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const CookiePolicy: React.FC = () => {
  return (
    <>
      <title>Cookie Policy - TrendiTools</title>
      <meta name="description" content="Learn about how TrendiTools uses cookies and similar technologies to enhance your browsing experience." />
      <meta name="keywords" content="cookies, privacy, tracking, TrendiTools, policy" />
      <link rel="canonical" href="https://trenditools.com/cookie-policy" />
      
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">Cookie Policy</h1>
            
            <div className="space-y-6">
              <p className="text-muted-foreground">
                <strong>Last updated:</strong> December 2024
              </p>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Types of Cookies We Use</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies are necessary for the website to function properly. They enable core 
                      functionality such as security, network management, and accessibility.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>Authentication and session management</li>
                      <li>Security and fraud prevention</li>
                      <li>Load balancing and performance optimization</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Functional Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies enable enhanced functionality and personalization, such as remembering 
                      your preferences and settings.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>User preferences and settings</li>
                      <li>Language and region preferences</li>
                      <li>Bookmarked tools and favorites</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Cookies</h3>
                    <p className="text-muted-foreground mb-2">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>Page views and user interactions</li>
                      <li>Search queries and results</li>
                      <li>Performance metrics and error tracking</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-3">
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Convex:</strong> For real-time database and authentication services</li>
                  <li><strong>Analytics providers:</strong> For website usage analysis</li>
                  <li><strong>AI services:</strong> For chat functionality and recommendations</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Managing Your Cookie Preferences</h2>
                <p className="text-muted-foreground mb-3">
                  You can control and manage cookies in several ways:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Browser Settings</h3>
                    <p className="text-muted-foreground mb-2">
                      Most browsers allow you to control cookies through their settings. You can:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>Block all cookies</li>
                      <li>Block third-party cookies</li>
                      <li>Delete existing cookies</li>
                      <li>Set preferences for specific websites</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Cookie Consent</h3>
                    <p className="text-muted-foreground mb-2">
                      When you first visit our website, you'll see a cookie consent banner. You can:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                      <li>Accept all cookies</li>
                      <li>Customize your preferences</li>
                      <li>Reject non-essential cookies</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Impact of Disabling Cookies</h2>
                <p className="text-muted-foreground mb-3">
                  If you choose to disable cookies, some features of our website may not function properly:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences won't be saved</li>
                  <li>Some personalization features may not work</li>
                  <li>We won't be able to remember your bookmarks</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons. We will notify you of any 
                  material changes by posting the updated policy on our website.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:contact@trenditools.com" className="text-primary hover:text-primary/80">contact@trenditools.com</a>
                </p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;