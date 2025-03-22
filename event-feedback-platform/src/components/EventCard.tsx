import { Event } from '@/db/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Partial<Event>;
  action?: {
    label: string;
    href: string;
  };
}

export function EventCard({ event, action }: EventCardProps) {
  // Format the date
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date TBD';

  // Determine if event is upcoming, ongoing, or past
  const now = new Date();
  const eventDate = event.date ? new Date(event.date) : null;
  let status = 'upcoming';

  if (eventDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      status = 'past';
    } else if (eventDate.toDateString() === today.toDateString()) {
      status = 'today';
    }
  }

  return (
    <Card className="event-card overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-primary/5 pb-4 relative">
        {status === 'today' && (
          <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Today</Badge>
        )}
        {status === 'past' && (
          <Badge className="absolute top-2 right-2 bg-slate-500 hover:bg-slate-600">Past</Badge>
        )}
        <CardTitle className="text-xl">{event.title || 'Untitled Event'}</CardTitle>
        <CardDescription>
          {event.description
            ? event.description.length > 100
                ? `${event.description.substring(0, 100)}...`
                : event.description
            : 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="space-y-3 text-sm">
          {event.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formattedDate}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{event.location}</span>
            </div>
          )}
          {event.attendees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>
                {event.attendees.length === 0
                  ? 'No attendees yet'
                  : `${event.attendees.length} ${event.attendees.length === 1 ? 'attendee' : 'attendees'}`}
              </span>
            </div>
          )}
        </div>

        {event.sessions && event.sessions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Sessions</h4>
            <div className="space-y-1">
              {event.sessions.slice(0, 2).map((session) => (
                <div key={session.id} className="text-xs p-2 bg-muted rounded">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-muted-foreground mt-1">
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
              ))}
              {event.sessions.length > 2 && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  +{event.sessions.length - 2} more sessions
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      {action && (
        <CardFooter className="pt-2 border-t mt-auto">
          <Button
            asChild
            className="w-full group transition-all"
            variant="ghost"
          >
            <Link href={action.href} className="flex items-center justify-between">
              <span>{action.label}</span>
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
