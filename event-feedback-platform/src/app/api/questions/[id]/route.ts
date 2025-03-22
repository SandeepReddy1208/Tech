import { NextResponse, NextRequest } from 'next/server';
import { upvoteQuestion, markQuestionAsAnswered } from '@/db';

interface RouteParams {
  params: {
    id: string;
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;
    const data = await request.json();
    const { action } = data;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updatedQuestion;

    if (action === 'upvote') {
      updatedQuestion = upvoteQuestion(id);
    } else if (action === 'markAsAnswered') {
      updatedQuestion = markQuestionAsAnswered(id);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be either "upvote" or "markAsAnswered"' },
        { status: 400 }
      );
    }

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
