import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getEventByAccessCode, joinEvent } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { accessCode, userId } = await request.json();

    if (!accessCode || !userId) {
      return NextResponse.json(
        { error: 'Access code and user ID are required' },
        { status: 400 }
      );
    }

    const event = getEventByAccessCode(accessCode);
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      );
    }

    // Check if event is active
    if (!event.active) {
      return NextResponse.json(
        { error: 'This event is no longer active' },
        { status: 400 }
      );
    }

    // Join the event
    const joined = joinEvent(event.id, userId);
    if (!joined) {
      return NextResponse.json(
        { error: 'User is already an attendee of this event' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location
      }
    });
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
