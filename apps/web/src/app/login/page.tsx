"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Lock, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { roleLabels, type UserRole } from '@/lib/types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('analyst');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const containerRef = useRef<HTMLDivElement>(null);
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
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }, containerRef);

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
          title: 'Welcome to FinFlow OS',
          description: 'You have been successfully authenticated.',
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
    <div ref={containerRef} className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <span className="text-2xl font-bold text-accent-foreground">F</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">FinFlow OS</h1>
              <p className="text-primary-foreground/60 text-sm">Enterprise Financial Platform</p>
            </div>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-light text-primary-foreground leading-tight mb-6">
            Secure Financial
            <br />
            <span className="font-semibold">Workflow Intelligence</span>
          </h2>
          
          <p className="text-primary-foreground/70 text-lg max-w-md leading-relaxed">
            Enterprise-grade financial data management, validation, and compliance platform trusted by leading institutions worldwide.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex items-center gap-2 text-primary-foreground/60">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/60">
              <Lock className="h-5 w-5 text-accent" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div ref={formRef} className="w-full max-w-md opacity-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FinFlow OS</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your secure financial portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background border-border focus:border-accent focus:ring-accent/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-background border-border focus:border-accent focus:ring-accent/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Access Role</Label>
              <Select value={role} onValueChange={(value) => value && setRole(value as UserRole)}>
                <SelectTrigger className="h-12 bg-background border-border focus:border-accent focus:ring-accent/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="cursor-pointer">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Protected by enterprise-grade security. By signing in, you agree to our
              <br />
              <a href="#" className="text-accent hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-4">
              Don't have an account?{' '}
              <Link href={"/signup" as any} className="text-accent hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Demo credentials: Use any email with password of 6+ characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
