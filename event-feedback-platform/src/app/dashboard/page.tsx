'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/db/schema';
import Link from 'next/link';
import {
  CalendarPlus,
  KeyRound,
  LayoutDashboard,
  BarChart,
  MessageSquare,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiError {
  message?: string;
  error?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [joiningEvent, setJoiningEvent] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch events
  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        let url = '/api/events';
        if (user.role === 'organizer') {
          url = `/api/events?organizerId=${user.id}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user, toast]);

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

    setJoiningEvent(true);

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
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || 'Failed to join event');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: `You have joined the event: ${data.event.title}`,
      });

      // Refresh events
      setAccessCode('');
      router.refresh();

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
      setJoiningEvent(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container py-16 px-4">
        <div className="flex justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-64px)]">
      <div className="bg-gradient-to-b from-primary to-accent text-white py-12">
        <div className="container px-4">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/80">
            Welcome back, {user.name}!
          </p>
        </div>
      </div>

      <div className="container py-8 px-4">
        {user.role === 'organizer' ? (
          /* Organizer Dashboard */
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="dashboard-stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarPlus className="h-5 w-5 text-primary" />
                    Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{events.length}</div>
                  <p className="text-sm text-muted-foreground">
                    Total events created
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Attendees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {events.reduce((sum, event) => sum + event.attendees.length, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total attendees across all events
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {/* This would be a real count in a production app */}
                    {events.length * 5}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total feedback received
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Events</h2>
              <Button asChild className="gap-2 shadow-sm hover:shadow-md transition-all">
                <Link href="/events/create">
                  <CalendarPlus className="h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
            </div>

            {loadingEvents ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    action={{
                      label: 'Manage Event',
                      href: `/events/${event.id}`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted text-center py-12">
                <CardContent>
                  <div className="rounded-full bg-blue-50 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CalendarPlus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first event to start collecting feedback from your attendees.
                  </p>
                  <Button asChild className="shadow-sm hover:shadow-md transition-all">
                    <Link href="/events/create">Create an Event</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Attendee Dashboard */
          <div className="animate-fade-in">
            <Card className="bg-card mb-8 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Join an Event
                </CardTitle>
                <CardDescription>
                  Enter an event access code to join and provide feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinEvent} className="flex gap-3">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter event access code"
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={joiningEvent}
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    {joiningEvent ? 'Joining...' : 'Join Event'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-semibold mb-6">Your Events</h2>

            {loadingEvents ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    action={{
                      label: 'View Event',
                      href: `/events/${event.id}`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted text-center py-12">
                <CardContent>
                  <div className="rounded-full bg-blue-50 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">No Events Joined Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Use an event access code to join an event and provide feedback. Access codes are provided by event organizers.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
