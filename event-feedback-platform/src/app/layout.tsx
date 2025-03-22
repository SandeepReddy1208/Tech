import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ClientBody } from './ClientBody';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Feedback Platform',
  description: 'A real-time feedback platform for events and conferences',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientBody>
            {children}
          </ClientBody>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
