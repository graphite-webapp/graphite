import { Metadata } from 'next';
import ClientLayout from './clientLayout';
import { MetadataProvider } from '@/lib/metadata';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MetadataProvider>
      <ClientLayout>{children}</ClientLayout>
    </MetadataProvider>
  );
}
