import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Feedback, Session, Event, User } from '@/db/schema';
import { Chart } from './Chart';

interface FeedbackDashboardProps {
  event: Event;
  userMap?: Record<string, User>;
}

export function FeedbackDashboard({ event, userMap = {} }: FeedbackDashboardProps) {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch(`/api/feedback?eventId=${event.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedbackData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchFeedback();

    // Set up auto-refresh interval
    const intervalId = setInterval(fetchFeedback, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [event.id, fetchFeedback]);

  // Calculate overall event statistics
  const calculateEventStats = () => {
    if (feedbackData.length === 0) {
      return { averageRating: 0, totalFeedback: 0, sentiment: 'No data' };
    }

    const totalRating = feedbackData.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / feedbackData.length;

    let sentiment = 'Neutral';
    if (averageRating >= 4) sentiment = 'Very Positive';
    else if (averageRating >= 3.5) sentiment = 'Positive';
    else if (averageRating < 2.5) sentiment = 'Negative';

    return {
      averageRating: averageRating.toFixed(1),
      totalFeedback: feedbackData.length,
      sentiment,
    };
  };

  // Calculate session statistics
  const calculateSessionStats = (sessionId: string) => {
    const sessionFeedback = feedbackData.filter(item => item.sessionId === sessionId);

    if (sessionFeedback.length === 0) {
      return { averageRating: 0, totalFeedback: 0, sentiment: 'No data' };
    }

    const totalRating = sessionFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / sessionFeedback.length;

    let sentiment = 'Neutral';
    if (averageRating >= 4) sentiment = 'Very Positive';
    else if (averageRating >= 3.5) sentiment = 'Positive';
    else if (averageRating < 2.5) sentiment = 'Negative';

    return {
      averageRating: averageRating.toFixed(1),
      totalFeedback: sessionFeedback.length,
      sentiment,
    };
  };

  // Get all unique tags used in feedback
  const allTags = feedbackData.reduce((tags, feedback) => {
    feedback.tags.forEach(tag => {
      if (!tags[tag]) tags[tag] = 0;
      tags[tag]++;
    });
    return tags;
  }, {} as Record<string, number>);

  // Prepare data for tags chart
  const tagsChartData = Object.entries(allTags)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 tags

  // Prepare data for ratings chart (distribution of ratings)
  const ratingsDistribution = feedbackData.reduce((dist, feedback) => {
    if (!dist[feedback.rating]) dist[feedback.rating] = 0;
    dist[feedback.rating]++;
    return dist;
  }, {} as Record<number, number>);

  const ratingsChartData = [1, 2, 3, 4, 5].map(rating => ({
    rating: rating.toString(),
    count: ratingsDistribution[rating] || 0,
  }));

  // Session-wise feedback counts
  const sessionFeedbackCounts = event.sessions.map(session => {
    const count = feedbackData.filter(fb => fb.sessionId === session.id).length;
    return {
      session: session.title,
      count
    };
  });

  const eventStats = calculateEventStats();

  if (loading) {
    return <div className="text-center py-6">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventStats.averageRating} / 5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {eventStats.totalFeedback} feedback submissions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventStats.sentiment}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculated from rating and comments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {tagsChartData.slice(0, 3).map(({ tag, count }) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag} ({count})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No feedback submitted yet.</p>
                ) : (
                  feedbackData
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map(feedback => {
                      const feedbackUser = feedback.anonymous
                        ? { name: 'Anonymous' }
                        : (userMap[feedback.userId] || { name: 'Unknown User' });
                      const session = event.sessions.find(s => s.id === feedback.sessionId) || { title: 'Unknown Session' };

                      return (
                        <div key={feedback.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-medium">{feedbackUser.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(feedback.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold">{feedback.rating}/5</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Session: {session.title}</p>
                          {feedback.comment && <p className="text-sm">{feedback.comment}</p>}
                          {feedback.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {feedback.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          {event.sessions.map(session => {
            const stats = calculateSessionStats(session.id);
            const sessionFeedback = feedbackData.filter(fb => fb.sessionId === session.id);

            return (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {session.speaker} • {session.startTime} - {session.endTime}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Average Rating</h4>
                      <p className="text-2xl font-bold">{stats.averageRating} / 5</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalFeedback} feedback submissions
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Sentiment</h4>
                      <p className="text-xl font-bold">{stats.sentiment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Status</h4>
                      <div className={`
                        px-2 py-1 inline-block rounded-full text-xs font-medium
                        ${session.status === 'active' ? 'bg-green-100 text-green-700' :
                          session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'}
                      `}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  {sessionFeedback.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-medium">Recent Feedback</h4>
                      {sessionFeedback
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 3)
                        .map(feedback => {
                          const feedbackUser = feedback.anonymous
                            ? { name: 'Anonymous' }
                            : (userMap[feedback.userId] || { name: 'Unknown User' });

                          return (
                            <div key={feedback.id} className="border-b pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <span className="font-medium">{feedbackUser.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {new Date(feedback.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold">{feedback.rating}/5</span>
                              </div>
                              {feedback.comment && <p className="text-sm">{feedback.comment}</p>}
                            </div>
                          );
                        })
                      }
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No feedback for this session yet.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackData.filter(fb => fb.comment).length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No comments have been submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedbackData
                    .filter(fb => fb.comment)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(feedback => {
                      const feedbackUser = feedback.anonymous
                        ? { name: 'Anonymous' }
                        : (userMap[feedback.userId] || { name: 'Unknown User' });
                      const session = event.sessions.find(s => s.id === feedback.sessionId) || { title: 'Unknown Session' };

                      return (
                        <div key={feedback.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-medium">{feedbackUser.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(feedback.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold">{feedback.rating}/5</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Session: {session.title}</p>
                          <p className="text-sm">{feedback.comment}</p>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {feedbackData.length > 0 ? (
                  <div className="w-full h-full flex justify-center items-center">
                    {/* In a real application, use a charting library like recharts or Chart.js */}
                    <div className="flex items-end h-[200px] w-full gap-4 px-10">
                      {ratingsChartData.map(data => (
                        <div key={data.rating} className="flex flex-col items-center flex-1">
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{
                              height: `${data.count ? (data.count / Math.max(...ratingsChartData.map(d => d.count))) * 180 : 0}px`
                            }}
                          ></div>
                          <div className="mt-2 text-sm">{data.rating}</div>
                          <div className="text-xs text-muted-foreground">{data.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Feedback Counts</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {feedbackData.length > 0 ? (
                  <div className="w-full h-full flex justify-center items-center">
                    {/* In a real application, use a charting library like recharts or Chart.js */}
                    <div className="flex flex-col justify-between h-full w-full py-4">
                      {sessionFeedbackCounts.map(data => (
                        <div key={data.session} className="flex items-center gap-2">
                          <div className="text-sm font-medium truncate w-32">{data.session}</div>
                          <div
                            className="h-4 bg-primary rounded"
                            style={{
                              width: `${data.count ? (data.count / Math.max(...sessionFeedbackCounts.map(d => d.count))) * 150 : 0}px`
                            }}
                          ></div>
                          <div className="text-xs ml-2">{data.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Tags Used</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {tagsChartData.length > 0 ? (
                <div className="w-full h-full flex justify-center items-center">
                  {/* In a real application, use a charting library like recharts or Chart.js */}
                  <div className="flex flex-col justify-between h-full w-full py-4">
                    {tagsChartData.map(data => (
                      <div key={data.tag} className="flex items-center gap-2">
                        <div className="text-sm font-medium w-32">{data.tag}</div>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: `${data.count ? (data.count / Math.max(...tagsChartData.map(d => d.count))) * 200 : 0}px`
                          }}
                        ></div>
                        <div className="text-xs ml-2">{data.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">No tags data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
