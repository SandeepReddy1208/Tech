import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, BarChart3, CalendarPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-slide-up">
            Real-time Feedback for Your Events
          </h1>
          <p className="text-xl md:text-2xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
            Boost engagement and improve content quality with live audience feedback during your events and conferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Link href="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm border-white hover:bg-white/30">
              <Link href="#how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to collect and analyze valuable feedback from your event attendees
          </p>
          <div className="grid md:grid-cols-3 gap-8 feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Feedback</h3>
              <p className="text-muted-foreground">
                Collect live ratings, comments, and feedback from your attendees during sessions to make instant improvements.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insightful Analytics</h3>
              <p className="text-muted-foreground">
                View comprehensive dashboards with actionable insights about audience engagement and sentiment.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CalendarPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Event Management</h3>
              <p className="text-muted-foreground">
                Create and manage events with simple tools, generate QR codes for easy attendee access, and track everything in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A simple four-step process to enhance your events with real-time feedback
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto step-grid">
            <div className="text-center">
              <div className="step-circle">
                1
              </div>
              <h3 className="font-semibold mb-2">Create an Event</h3>
              <p className="text-sm text-muted-foreground">
                Sign up as an organizer and create your event with all necessary details.
              </p>
            </div>
            <div className="text-center">
              <div className="step-circle">
                2
              </div>
              <h3 className="font-semibold mb-2">Share Access Code</h3>
              <p className="text-sm text-muted-foreground">
                Distribute the unique code or QR code to your event attendees.
              </p>
            </div>
            <div className="text-center">
              <div className="step-circle">
                3
              </div>
              <h3 className="font-semibold mb-2">Collect Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Attendees submit ratings and comments during sessions in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="step-circle">
                4
              </div>
              <h3 className="font-semibold mb-2">Analyze Results</h3>
              <p className="text-sm text-muted-foreground">
                View dashboards and make data-driven improvements to your events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Events?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start collecting valuable feedback from your attendees and improve your events today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all">
              <Link href="/register?role=organizer">
                Register as Organizer
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register?role=attendee">
                Join as Attendee
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
