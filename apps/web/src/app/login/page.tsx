"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Lock, Mail, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import styles from '../stars.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome Back',
          description: 'Accessing secure connection...',
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
                Secure Financial<br/>
                <span className="font-semibold text-white">Workflow Intelligence</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Access your enterprise-grade financial data management, validation, and compliance dashboard.
              </p>
              
              <div className="flex flex-wrap justify-center">
                <div className={styles.systemBadge}>
                  <Lock size={14} /> SOC 2 Compliant
                </div>
                <div className={styles.systemBadge}>
                  <Shield size={14} /> Bank-Level Security
                </div>
              </div>
            </div>
            
            {/* Decorative background accent for left panel */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Right Side: Login Form (Reordered Second) */}
          <div className={styles.authFormSide}>
            <div className="mb-8">
              <h2 className="text-2xl font-light text-white mb-2">Welcome Back</h2>
              <p className="text-white/60 font-light text-sm">Enter your credentials to access the system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${styles.buttonPrimary} py-3 rounded-lg mt-4 flex items-center justify-center`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-white/40 text-sm">
                New to FinFlowOs?{' '}
                <Link href="/signup" className="text-white hover:text-white/80 font-medium transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
