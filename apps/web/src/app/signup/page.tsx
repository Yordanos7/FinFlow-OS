"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Lock, Mail, Loader2, User, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import styles from '../stars.module.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }, formRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Please check your details and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account Created',
          description: 'Welcome to FinFlow OS! You are being redirected.',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      <div className={styles.stars3}></div>
      
      <div className={styles.authContainer}>
        <div ref={formRef} className={`${styles.glassCard} ${styles.authCard}`}>
        
          {/* Left Side: System Info (Reordered First) */}
          <div className={styles.authSideInfo}>
            <div className="mb-8 flex flex-col items-center">
              <Link href="/" className="inline-flex items-center text-white/50 hover:text-white mb-8 transition-colors text-sm">
                <ArrowLeft size={16} className="mr-2" /> Back to Home
              </Link>
              <h1 className="text-4xl font-light text-white tracking-wider mb-4">FinFlow OS</h1>
              <p className="text-white/80 text-lg font-light leading-relaxed mb-8">
                Join the<br/>
                <span className="font-semibold text-white">Workflow Revolution</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Create an account to verify financial data with our AI-powered validation engine.
              </p>
              
              <div className="flex flex-wrap justify-center">
                <div className={styles.systemBadge}>
                  <CheckCircle size={14} /> Instant Access
                </div>
                <div className={styles.systemBadge}>
                  <Shield size={14} /> Encrypted Data
                </div>
              </div>
            </div>
            
            {/* Decorative background accent for left panel */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Right Side: Signup Form (Reordered Second) */}
          <div className={styles.authFormSide}>
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white mb-2">Create Account</h2>
              <p className="text-white/60 font-light text-sm">Set up your secure profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={styles.inputLabel}>Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    placeholder="John Doe"
                    required
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 h-5 w-5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                    placeholder="name@company.com"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 h-5 w-5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 h-5 w-5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.inputField}
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 h-5 w-5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${styles.buttonPrimary} py-3 rounded-lg mt-6 flex items-center justify-center`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-white/40 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:text-white/80 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
