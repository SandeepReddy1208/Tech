import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Event } from '@/db/schema';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';

interface EventQRCodeProps {
  event: Event;
  baseUrl: string;
}

export function EventQRCode({ event, baseUrl }: EventQRCodeProps) {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR Code
    // In a real app, we would use a QR code library
    // For this demo, we'll use a placeholder URL
    const url = `${baseUrl}/events/join?code=${event.accessCode}`;
    setJoinUrl(url);

    // Use Google Charts API to generate a QR code
    const encodedUrl = encodeURIComponent(url);
    setQrCodeUrl(`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodedUrl}&choe=UTF-8`);
  }, [event.accessCode, baseUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      toast({
        title: 'Copied!',
        description: 'Join link copied to clipboard',
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${event.title}`,
          text: `Use this link to join the event and provide feedback`,
          url: joinUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Access Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground mb-1">Scan the QR code or share the link</p>
          <p className="text-2xl font-bold font-mono tracking-wider">{event.accessCode}</p>
        </div>

        {qrCodeUrl && (
          <div className="flex justify-center p-2 bg-white rounded-lg">
            <img
              src={qrCodeUrl}
              alt="QR Code for Event Access"
              width={250}
              height={250}
              className="w-[250px] h-[250px]"
            />
          </div>
        )}

        <div className="w-full flex gap-2">
          <Input value={joinUrl} readOnly className="flex-1" />
          <Button onClick={copyToClipboard} size="icon" variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
          <Button onClick={shareLink} size="icon" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center mt-2">
          Attendees can use this code or link to join and provide feedback
        </div>
      </CardContent>
    </Card>
  );
}
