'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event, User } from '@/db/schema';
import { useToast } from '@/hooks/use-toast';
import { EventQRCode } from '@/components/EventQRCode';
import { FeedbackDashboard } from '@/components/FeedbackDashboard';
import { FeedbackForm } from '@/components/FeedbackForm';
import { QuestionForm } from '@/components/QuestionForm';
import { QuestionList } from '@/components/QuestionList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function EventPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch event data
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const data = await response.json();
        setEvent(data);

        // Set the first session as active by default
        if (data.sessions && data.sessions.length > 0) {
          setActiveSessionId(data.sessions[0].id);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [id, toast]);

  // Fetch users for attendee names
  useEffect(() => {
    if (!event) return;

    const fetchUsers = async () => {
      try {
        // In a real app, you would have an API endpoint to fetch all users
        // For this demo, we'll just use the sample users
        // This is where you would make the actual API call in a real app

        // Simulating response...
        const usersById: Record<string, User> = {};
        event.attendees.forEach(userId => {
          usersById[userId] = { id: userId, name: `User ${userId}`, email: '', role: 'attendee', password: '' };
        });

        setUserMap(usersById);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [event]);

  if (loading || !user) {
    return (
      <div className="container py-16 px-4">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (loadingEvent) {
    return (
      <div className="container py-16 px-4">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or you don't have access.</p>
        <Button asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  const isOrganizer = user.role === 'organizer' && event.organizerId === user.id;
  const isAttendee = event.attendees.includes(user.id);
  const activeSession = event.sessions.find(session => session.id === activeSessionId) || event.sessions[0];

  // Format the date
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  return (
    <div className="container py-16 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Event Details Column */}
        <div className="lg:w-1/3">
          <div className="space-y-6 sticky top-6">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">{event.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{event.attendees.length} attendees</span>
              </div>
            </div>

            {isOrganizer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Event Access</CardTitle>
                  <CardDescription>
                    Share this code with attendees to join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventQRCode event={event} baseUrl={window.location.origin} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.sessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      session.id === activeSessionId
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <h3 className="font-medium">{session.title}</h3>
                    <div className="text-sm flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="text-sm mt-1">{session.speaker}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Column */}
        <div className="lg:w-2/3">
          {isOrganizer ? (
            /* Organizer View */
            <div>
              <h2 className="text-2xl font-bold mb-6">Event Dashboard</h2>
              <FeedbackDashboard event={event} userMap={userMap} />
            </div>
          ) : isAttendee ? (
            /* Attendee View */
            <div>
              <h2 className="text-2xl font-bold mb-4">{activeSession.title}</h2>
              <div className="text-muted-foreground mb-6">
                {activeSession.speaker} • {activeSession.startTime} - {activeSession.endTime}
              </div>

              <Tabs defaultValue="feedback">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="feedback">Provide Feedback</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>

                <TabsContent value="feedback" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Feedback</CardTitle>
                      <CardDescription>
                        Your feedback helps improve the content and presentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FeedbackForm
                        eventId={event.id}
                        sessionId={activeSession.id}
                        userId={user.id}
                        session={activeSession}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Ask a Question</CardTitle>
                      <CardDescription>
                        Have a question about the session? Ask here!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QuestionForm
                        eventId={event.id}
                        sessionId={activeSession.id}
                        userId={user.id}
                      />
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">Questions</h3>
                    <QuestionList
                      sessionId={activeSession.id}
                      userMap={userMap}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Not Attendee View */
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Join This Event</h2>
              <p className="text-muted-foreground mb-6">
                You need to join this event to provide feedback and ask questions.
              </p>
              <Button onClick={() => {
                // Handle join event logic
                toast({
                  title: 'Joining Event',
                  description: 'This feature is not implemented in the demo',
                });
              }}>
                Join Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
