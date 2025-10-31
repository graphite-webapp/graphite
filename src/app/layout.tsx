import { Metadata } from 'next';
import ClientLayout from './clientLayout';

export const metadata: Metadata = {
  title: 'Graphite',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
