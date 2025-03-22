'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

export default function JoinEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [accessCode, setAccessCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Get code from URL if present
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setAccessCode(codeParam);
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast({
        title: 'Access Code Required',
        description: 'Please enter the event access code',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessCode: accessCode.trim(),
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join event');
      }

      const data = await response.json();
      toast({
        title: 'Successfully Joined',
        description: `You have joined the event: ${data.event.title}`,
      });

      // Redirect to the event page
      router.push(`/events/${data.event.id}`);
    } catch (error) {
      console.error('Error joining event:', error);
      let errorMessage = 'Failed to join event';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 px-4">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join an Event</CardTitle>
          <CardDescription>
            Enter the access code provided by the event organizer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinEvent} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">
                Event Access Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter code (e.g., TECH2025)"
                  className="pl-10"
                  autoComplete="off"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The access code is case-sensitive
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Event'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
