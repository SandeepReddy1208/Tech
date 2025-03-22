import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getEvents, createEvent, getEventsByOrganizerId } from '@/db';
import { Event } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get('organizerId');

    if (organizerId) {
      const events = getEventsByOrganizerId(organizerId);
      return NextResponse.json(events);
    }

    const events = getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'location', 'organizerId'];
    const missingFields = requiredFields.filter(field => !eventData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Set default values if not provided
    const newEventData: Omit<Event, 'id'> = {
      ...eventData,
      sessions: eventData.sessions || [],
      attendees: eventData.attendees || [],
      active: eventData.active !== undefined ? eventData.active : true,
      accessCode: eventData.accessCode || generateAccessCode(),
    };

    const newEvent = createEvent(newEventData);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a random access code
function generateAccessCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
