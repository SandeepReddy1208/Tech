export type User = {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'attendee';
  password: string; // In a real app, this would be hashed
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizerId: string;
  sessions: Session[];
  attendees: string[]; // User IDs
  active: boolean;
  accessCode: string; // Code for attendees to join
};

export type Session = {
  id: string;
  title: string;
  speaker: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed';
};

export type Feedback = {
  id: string;
  eventId: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  rating: number; // 1-5
  comment: string;
  tags: string[]; // e.g., 'insightful', 'confusing', 'engaging'
  anonymous: boolean;
};

export type Question = {
  id: string;
  eventId: string;
  sessionId: string;
  userId: string;
  question: string;
  timestamp: string;
  upvotes: number;
  answered: boolean;
  anonymous: boolean;
};

// For demonstration, we'll use these sample data
export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Organizer',
    email: 'john@example.com',
    role: 'organizer',
    password: 'password123',
  },
  {
    id: '2',
    name: 'Jane Attendee',
    email: 'jane@example.com',
    role: 'attendee',
    password: 'password123',
  },
];

export const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'A conference about the latest in technology',
    date: '2025-05-15',
    location: 'San Francisco, CA',
    organizerId: '1',
    sessions: [
      {
        id: '101',
        title: 'Introduction to AI',
        speaker: 'Dr. Smith',
        description: 'Learn about the basics of AI and its applications',
        startTime: '09:00',
        endTime: '10:30',
        status: 'upcoming',
      },
      {
        id: '102',
        title: 'Web Development Trends',
        speaker: 'Jane Doe',
        description: 'Discover the latest trends in web development',
        startTime: '11:00',
        endTime: '12:30',
        status: 'upcoming',
      },
    ],
    attendees: ['2'],
    active: true,
    accessCode: 'TECH2025',
  },
];

export const sampleFeedback: Feedback[] = [
  {
    id: '1',
    eventId: '1',
    sessionId: '101',
    userId: '2',
    timestamp: '2025-05-15T09:15:00',
    rating: 4,
    comment: 'Great session so far! Very engaging.',
    tags: ['engaging', 'informative'],
    anonymous: false,
  },
];

export const sampleQuestions: Question[] = [
  {
    id: '1',
    eventId: '1',
    sessionId: '101',
    userId: '2',
    question: 'How does this relate to machine learning?',
    timestamp: '2025-05-15T09:20:00',
    upvotes: 3,
    answered: false,
    anonymous: false,
  },
];
