'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, MessageSquare } from 'lucide-react';

export function ClientBody({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl flex items-center gap-2 text-primary">
            <MessageSquare className="h-5 w-5" />
            Event Feedback
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-primary/10">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-fade-in">
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    Signed in as {user.role}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard`} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'organizer' && (
                    <DropdownMenuItem asChild>
                      <Link href="/events/create" className="cursor-pointer">
                        Create Event
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="shadow-sm hover:shadow-md transition-all">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="font-bold text-xl flex items-center gap-2 text-primary mb-4">
                <MessageSquare className="h-5 w-5" />
                Event Feedback
              </Link>
              <p className="text-sm text-muted-foreground">
                A real-time platform for collecting and analyzing feedback for events and conferences.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to enhance your events with real-time feedback?
              </p>
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full">
                  <Link href="/register?role=organizer">
                    Register as Organizer
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/register?role=attendee">
                    Join as Attendee
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Event Feedback Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
