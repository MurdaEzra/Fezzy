import React, { useState } from 'react';
import { Button } from './ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from
'./ui/Card';
import { Input } from './ui/Input';
import { Store, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageType } from '../App';
interface AuthPageProps {
  initialTab: 'login' | 'signup';
  navigate: (page: PageType) => void;
}
export function AuthPage({ initialTab, navigate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [storeName, setStoreName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const generateSubdomain = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'storename';
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedToTerms) return;
    // Mock authentication - route to dashboard
    navigate('dashboard');
  };
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </button>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-foreground">
              FEZZY
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            transition={{
              duration: 0.3
            }}>

            <Card className="shadow-xl border-border/50">
              <CardHeader className="space-y-1">
                <div className="flex bg-muted p-1 rounded-lg mb-6">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setIsLogin(true)}>

                    Log in
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setIsLogin(false)}>

                    Sign up
                  </button>
                </div>
                <CardTitle className="text-2xl text-center">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </CardTitle>
                <CardDescription className="text-center">
                  {isLogin ?
                  'Enter your email to sign in to your store' :
                  'Start your 14-day free trial today'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin &&
                  <div className="space-y-2">
                      <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="fullName">

                        Full Name
                      </label>
                      <Input id="fullName" placeholder="John Doe" required />
                    </div>
                  }

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="email">

                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required />

                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className="text-sm font-medium text-foreground"
                        htmlFor="password">

                        Password
                      </label>
                      {isLogin &&
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline">

                          Forgot password?
                        </a>
                      }
                    </div>
                    <Input id="password" type="password" required />
                  </div>

                  {!isLogin &&
                  <>
                      <div className="space-y-2">
                        <label
                        className="text-sm font-medium text-foreground"
                        htmlFor="storeName">

                          Store Name
                        </label>
                        <Input
                        id="storeName"
                        placeholder="My Awesome Store"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required />

                        <p className="text-xs text-muted-foreground mt-1">
                          Your store will be at:{' '}
                          <span className="font-medium text-foreground">
                            {generateSubdomain(storeName)}.fezzy.com
                          </span>
                        </p>
                      </div>

                      <div className="flex items-start space-x-2 mt-4">
                        <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)} />

                        <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-snug">

                          I agree to the{' '}
                          <button
                          type="button"
                          className="text-primary hover:underline font-medium"
                          onClick={() => setShowTerms(true)}>

                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button
                          type="button"
                          className="text-primary hover:underline font-medium"
                          onClick={() => setShowPrivacy(true)}>

                            Privacy Policy
                          </button>
                        </label>
                      </div>
                    </>
                  }

                  <Button
                    type="submit"
                    className="w-full mt-6 h-11"
                    disabled={!isLogin && !agreedToTerms}>

                    {isLogin ? 'Log in' : 'Create Store'}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-11" type="button">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4" />

                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853" />

                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05" />

                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335" />

                  </svg>
                  Google
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                <p className="text-sm text-muted-foreground">
                  {isLogin ?
                  "Don't have an account? " :
                  'Already have an account? '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => setIsLogin(!isLogin)}>

                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Terms Modal */}
      {showTerms &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0.95
          }}
          className="bg-card w-full max-w-lg rounded-lg shadow-xl border border-border overflow-hidden flex flex-col max-h-[80vh]">

            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Terms of Service</h2>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTerms(false)}>

                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>1. Acceptance of Terms</strong>
                <br />
                By accessing and using FEZZY, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>
              <p>
                <strong>2. Account Responsibilities</strong>
                <br />
                You are responsible for maintaining the confidentiality of your
                account and password and for restricting access to your
                computer, and you agree to accept responsibility for all
                activities that occur under your account or password.
              </p>
              <p>
                <strong>3. Payment Terms</strong>
                <br />
                All payments processed through our platform, including M-Pesa
                transactions, are subject to our standard processing fees as
                outlined in our pricing page. You agree to provide current,
                complete, and accurate purchase and account information for all
                purchases made at our store.
              </p>
              <p>
                <strong>4. Intellectual Property</strong>
                <br />
                The Service and its original content, features, and
                functionality are and will remain the exclusive property of
                FEZZY and its licensors.
              </p>
              <p>
                <strong>5. Termination</strong>
                <br />
                We may terminate or suspend access to our Service immediately,
                without prior notice or liability, for any reason whatsoever,
                including without limitation if you breach the Terms.
              </p>
            </div>
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
              <Button onClick={() => setShowTerms(false)}>I Understand</Button>
            </div>
          </motion.div>
        </div>
      }

      {/* Privacy Modal */}
      {showPrivacy &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0.95
          }}
          className="bg-card w-full max-w-lg rounded-lg shadow-xl border border-border overflow-hidden flex flex-col max-h-[80vh]">

            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Privacy Policy</h2>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPrivacy(false)}>

                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>1. Information Collection</strong>
                <br />
                We collect information from you when you register on our site,
                place an order, subscribe to our newsletter, respond to a survey
                or fill out a form. When ordering or registering on our site, as
                appropriate, you may be asked to enter your: name, e-mail
                address, mailing address, phone number or credit card
                information.
              </p>
              <p>
                <strong>2. M-Pesa Transaction Data</strong>
                <br />
                For transactions processed via M-Pesa, we collect and store
                transaction references, phone numbers, and amounts to facilitate
                order fulfillment and refunds. We do not store your M-Pesa PIN.
              </p>
              <p>
                <strong>3. Use of Information</strong>
                <br />
                Any of the information we collect from you may be used in one of
                the following ways: To personalize your experience; To improve
                our website; To improve customer service; To process
                transactions; To send periodic emails.
              </p>
              <p>
                <strong>4. Cookies</strong>
                <br />
                We use cookies to help us remember and process the items in your
                shopping cart, understand and save your preferences for future
                visits and compile aggregate data about site traffic and site
                interaction.
              </p>
              <p>
                <strong>5. Third-Party Disclosure</strong>
                <br />
                We do not sell, trade, or otherwise transfer to outside parties
                your personally identifiable information. This does not include
                trusted third parties who assist us in operating our website,
                conducting our business, or servicing you, so long as those
                parties agree to keep this information confidential.
              </p>
            </div>
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
              <Button onClick={() => setShowPrivacy(false)}>
                I Understand
              </Button>
            </div>
          </motion.div>
        </div>
      }
    </div>);

}