import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getQuestionsByEventId, getQuestionsBySessionId, createQuestion } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const sessionId = searchParams.get('sessionId');

    if (eventId) {
      const questions = getQuestionsByEventId(eventId);
      return NextResponse.json(questions);
    } else if (sessionId) {
      const questions = getQuestionsBySessionId(sessionId);
      return NextResponse.json(questions);
    }

    return NextResponse.json(
      { error: 'Either eventId or sessionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const questionData = await request.json();

    // Validate required fields
    const requiredFields = ['eventId', 'sessionId', 'userId', 'question'];
    const missingFields = requiredFields.filter(field => !questionData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Set default values if not provided
    const newQuestionData = {
      ...questionData,
      timestamp: questionData.timestamp || new Date().toISOString(),
      upvotes: 0,
      answered: false,
      anonymous: questionData.anonymous !== undefined ? questionData.anonymous : false,
    };

    const newQuestion = createQuestion(newQuestionData);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
