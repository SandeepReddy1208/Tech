'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, Plus, TrashIcon } from 'lucide-react';

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [sessions, setSessions] = useState<{
    title: string;
    speaker: string;
    description: string;
    startTime: string;
    endTime: string;
  }[]>([
    { title: '', speaker: '', description: '', startTime: '', endTime: '' },
  ]);

  // Redirect to login if not authenticated or not an organizer
  useEffect(() => {
    if (!loading && (!user || user.role !== 'organizer')) {
      toast({
        title: 'Unauthorized',
        description: 'Only organizers can create events',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, loading, router, toast]);

  const handleAddSession = () => {
    setSessions([...sessions, { title: '', speaker: '', description: '', startTime: '', endTime: '' }]);
  };

  const handleRemoveSession = (index: number) => {
    if (sessions.length === 1) {
      toast({
        title: 'Cannot Remove',
        description: 'Events must have at least one session',
        variant: 'destructive',
      });
      return;
    }
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = { ...updatedSessions[index], [field]: value };
    setSessions(updatedSessions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !description || !date || !location) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields for the event',
        variant: 'destructive',
      });
      return;
    }

    // Validate sessions
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      if (!session.title || !session.speaker || !session.startTime || !session.endTime) {
        toast({
          title: 'Incomplete Session',
          description: `Session ${i + 1} is missing required fields`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        title,
        description,
        date,
        location,
        organizerId: user!.id,
        sessions: sessions.map((session, index) => ({
          ...session,
          id: `session-${index + 1}`,
          status: 'upcoming',
        })),
        attendees: [],
        active: true,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      toast({
        title: 'Event Created',
        description: 'Your event has been created successfully',
      });

      router.push(`/events/${data.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Creation Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container py-16 px-4">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Enter the basic information about your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Event Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Tech Conference 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Event Date *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location *
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>
                Add sessions to your event
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSession}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessions.map((session, index) => (
              <div key={index} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Session {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSession(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`session-${index}-title`} className="text-sm font-medium">
                    Session Title *
                  </label>
                  <Input
                    id={`session-${index}-title`}
                    value={session.title}
                    onChange={(e) => updateSession(index, 'title', e.target.value)}
                    placeholder="e.g., Introduction to AI"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`session-${index}-speaker`} className="text-sm font-medium">
                    Speaker *
                  </label>
                  <Input
                    id={`session-${index}-speaker`}
                    value={session.speaker}
                    onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                    placeholder="e.g., Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`session-${index}-description`} className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id={`session-${index}-description`}
                    value={session.description}
                    onChange={(e) => updateSession(index, 'description', e.target.value)}
                    placeholder="Describe this session..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor={`session-${index}-start`} className="text-sm font-medium">
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`session-${index}-start`}
                        type="time"
                        value={session.startTime}
                        onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`session-${index}-end`} className="text-sm font-medium">
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`session-${index}-end`}
                        type="time"
                        value={session.endTime}
                        onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
