'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast({
          title: 'Login Successful',
          description: 'You have been logged in successfully',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, provide sample login credentials
  const loginAsSampleOrganizer = async () => {
    setEmail('john@example.com');
    setPassword('password123');

    setIsLoading(true);

    try {
      const success = await login('john@example.com', 'password123');

      if (success) {
        toast({
          title: 'Login Successful',
          description: 'You have been logged in as a sample organizer',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Sample Login Failed',
          description: 'Failed to log in with sample credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Sample login error:', error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsSampleAttendee = async () => {
    setEmail('jane@example.com');
    setPassword('password123');

    setIsLoading(true);

    try {
      const success = await login('jane@example.com', 'password123');

      if (success) {
        toast({
          title: 'Login Successful',
          description: 'You have been logged in as a sample attendee',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Sample Login Failed',
          description: 'Failed to log in with sample credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Sample login error:', error);
      toast({
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4 animate-fade-in">
      <Card className="shadow-lg border-opacity-50">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link href="#" className="text-xs text-primary hover:underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full shadow-sm hover:shadow-md transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <Button
                onClick={loginAsSampleOrganizer}
                variant="outline"
                disabled={isLoading}
                className="border-primary/50 hover:border-primary text-primary/80 hover:text-primary transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Log in as Sample Organizer
              </Button>
              <Button
                onClick={loginAsSampleAttendee}
                variant="outline"
                disabled={isLoading}
                className="border-primary/50 hover:border-primary text-primary/80 hover:text-primary transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Log in as Sample Attendee
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline underline-offset-4">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
