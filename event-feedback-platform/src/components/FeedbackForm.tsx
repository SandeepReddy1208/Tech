import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@/db/schema';

interface FeedbackFormProps {
  eventId: string;
  sessionId: string;
  userId: string;
  session: Session;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackForm({ eventId, sessionId, userId, session, onFeedbackSubmitted }: FeedbackFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const possibleTags = ['engaging', 'confusing', 'insightful', 'helpful', 'boring', 'too fast', 'too slow'];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast({
        title: 'Rating required',
        description: 'Please provide a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sessionId,
          userId,
          rating,
          comment,
          tags: selectedTags,
          anonymous: isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });

      // Reset form
      setRating(null);
      setComment('');
      setSelectedTags([]);

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">How would you rate this session?</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={rating === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRating(value)}
              className="w-10 h-10 rounded-full"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Comments (optional)</h3>
        <Textarea
          placeholder="Share your thoughts about the session..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Tags (optional)</h3>
        <div className="flex flex-wrap gap-2">
          {possibleTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTagToggle(tag)}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="anonymous">Submit anonymously</label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !rating}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
