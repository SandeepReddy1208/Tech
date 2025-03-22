import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getFeedbackByEventId, getFeedbackBySessionId, createFeedback } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const sessionId = searchParams.get('sessionId');

    if (eventId) {
      const feedback = getFeedbackByEventId(eventId);
      return NextResponse.json(feedback);
    } else if (sessionId) {
      const feedback = getFeedbackBySessionId(sessionId);
      return NextResponse.json(feedback);
    }

    return NextResponse.json(
      { error: 'Either eventId or sessionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();

    // Validate required fields
    const requiredFields = ['eventId', 'sessionId', 'userId', 'rating'];
    const missingFields = requiredFields.filter(field => !feedbackData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Set default values if not provided
    const newFeedbackData = {
      ...feedbackData,
      timestamp: feedbackData.timestamp || new Date().toISOString(),
      comment: feedbackData.comment || '',
      tags: feedbackData.tags || [],
      anonymous: feedbackData.anonymous !== undefined ? feedbackData.anonymous : false,
    };

    const newFeedback = createFeedback(newFeedbackData);
    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
