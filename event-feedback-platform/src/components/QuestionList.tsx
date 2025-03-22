import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Question, User } from '@/db/schema';
import { ArrowUpCircle, Check } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface QuestionListProps {
  sessionId: string;
  autoRefresh?: boolean;
  userMap?: Record<string, User>;
}

export function QuestionList({ sessionId, autoRefresh = true, userMap = {} }: QuestionListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();

      // Sort questions by upvotes (highest first) and then by timestamp (newest first)
      const sortedQuestions = data.sort((a: Question, b: Question) => {
        if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setQuestions(sortedQuestions);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchQuestions();

    // Set up auto-refresh interval if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchQuestions, 15000); // Refresh every 15 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId, autoRefresh, fetchQuestions]);

  const handleUpvote = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'upvote' }),
      });

      if (!response.ok) {
        throw new Error('Failed to upvote question');
      }

      // Update questions locally for immediate UI feedback
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
        ).sort((a, b) => {
          if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        })
      );

    } catch (err) {
      console.error('Error upvoting question:', err);
      toast({
        title: 'Error',
        description: 'Failed to upvote question. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsAnswered = async (questionId: string) => {
    if (!user || user.role !== 'organizer') {
      toast({
        title: 'Unauthorized',
        description: 'Only organizers can mark questions as answered',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'markAsAnswered' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark question as answered');
      }

      // Update questions locally for immediate UI feedback
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, answered: true } : q
        )
      );

    } catch (err) {
      console.error('Error marking question as answered:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark question as answered. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-6">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center text-muted-foreground py-6">No questions yet. Be the first to ask!</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const questionUser = userMap[question.userId] || { name: question.anonymous ? 'Anonymous' : 'Unknown User' };
        const displayName = question.anonymous ? 'Anonymous' : questionUser.name;

        return (
          <Card key={question.id} className={question.answered ? 'bg-green-50 border-green-100' : ''}>
            <CardContent className="pt-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{formatTimestamp(question.timestamp)}</span>
              </div>
              <p className="mb-2">{question.question}</p>

              {question.answered && (
                <div className="text-green-600 text-sm flex items-center gap-1 mt-2">
                  <Check className="h-4 w-4" />
                  <span>Answered</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleUpvote(question.id)}
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span>{question.upvotes || 0}</span>
              </Button>

              {user?.role === 'organizer' && !question.answered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsAnswered(question.id)}
                >
                  Mark as Answered
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
