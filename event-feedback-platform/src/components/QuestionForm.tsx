import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface QuestionFormProps {
  eventId: string;
  sessionId: string;
  userId: string;
  onQuestionSubmitted?: () => void;
}

export function QuestionForm({ eventId, sessionId, userId, onQuestionSubmitted }: QuestionFormProps) {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast({
        title: 'Question required',
        description: 'Please enter your question before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sessionId,
          userId,
          question: question.trim(),
          anonymous: isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit question');
      }

      toast({
        title: 'Question submitted',
        description: 'Your question has been submitted successfully!',
      });

      // Reset form
      setQuestion('');

      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: 'Submission error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Ask a Question</h3>
        <Textarea
          placeholder="What would you like to ask the speaker?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous-question"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="anonymous-question">Ask anonymously</label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !question.trim()}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Question'}
      </Button>
    </form>
  );
}
