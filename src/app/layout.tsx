'use client';
import { useState, useEffect } from 'react';
import UserProvider from '@/lib/userContext';
import NavBar from '@/components/layout/navbar';
import '@/styles/globals.scss';
import GridOverlay from '@/components/layout/gridoverlay';
import { Montserrat, Comfortaa, Fredoka } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

// const winkySans = Winky_Sans({ subsets: ['latin'], variable: '--font-winky-sans' });
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + G
      if (e.shiftKey && e.key.toLowerCase() === 'g') {
        setShowGrid(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <html lang="en" className={`${montserrat.variable} ${comfortaa.variable} ${fredoka.variable}`}>
      <body className="d-flex flex-col flex-center">
        {process.env.NODE_ENV === 'development' && <GridOverlay show={showGrid} />}
        <UserProvider>
          <NavBar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
