import {
  User,
  Event,
  Feedback,
  Question,
  sampleUsers,
  sampleEvents,
  sampleFeedback,
  sampleQuestions,
} from './schema';

// In a real app, this would be a database connection
// For now, we'll use in-memory data that persists during the server's lifetime
const users = [...sampleUsers];
const events = [...sampleEvents];
const feedbacks = [...sampleFeedback];
const questions = [...sampleQuestions];

// User operations
export const getUsers = () => users;
export const getUserById = (id: string) => users.find(user => user.id === id);
export const getUserByEmail = (email: string) => users.find(user => user.email === email);
export const createUser = (user: Omit<User, 'id'>) => {
  const newUser = { ...user, id: crypto.randomUUID() };
  users.push(newUser);
  return newUser;
};

// Event operations
export const getEvents = () => events;
export const getEventById = (id: string) => events.find(event => event.id === id);
export const getEventsByOrganizerId = (organizerId: string) =>
  events.filter(event => event.organizerId === organizerId);
export const createEvent = (event: Omit<Event, 'id'>) => {
  const newEvent = { ...event, id: crypto.randomUUID() };
  events.push(newEvent);
  return newEvent;
};
export const updateEvent = (id: string, event: Partial<Event>) => {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...event };
    return events[index];
  }
  return null;
};

// Feedback operations
export const getFeedbackByEventId = (eventId: string) =>
  feedbacks.filter(feedback => feedback.eventId === eventId);
export const getFeedbackBySessionId = (sessionId: string) =>
  feedbacks.filter(feedback => feedback.sessionId === sessionId);
export const createFeedback = (feedback: Omit<Feedback, 'id'>) => {
  const newFeedback = { ...feedback, id: crypto.randomUUID() };
  feedbacks.push(newFeedback);
  return newFeedback;
};

// Question operations
export const getQuestionsByEventId = (eventId: string) =>
  questions.filter(question => question.eventId === eventId);
export const getQuestionsBySessionId = (sessionId: string) =>
  questions.filter(question => question.sessionId === sessionId);
export const createQuestion = (question: Omit<Question, 'id'>) => {
  const newQuestion = { ...question, id: crypto.randomUUID() };
  questions.push(newQuestion);
  return newQuestion;
};
export const upvoteQuestion = (id: string) => {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], upvotes: questions[index].upvotes + 1 };
    return questions[index];
  }
  return null;
};
export const markQuestionAsAnswered = (id: string) => {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], answered: true };
    return questions[index];
  }
  return null;
};

// Helper function to get event by access code
export const getEventByAccessCode = (accessCode: string) =>
  events.find(event => event.accessCode === accessCode);

// Helper function to join an event as an attendee
export const joinEvent = (eventId: string, userId: string) => {
  const event = events.find(e => e.id === eventId);
  if (event && !event.attendees.includes(userId)) {
    event.attendees.push(userId);
    return true;
  }
  return false;
};
