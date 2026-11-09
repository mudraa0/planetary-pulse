import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planetary Pulse · NASA Space Apps 2026',
  description:
    'Interactive 3D/2D digital twin of Earth floating in deep space for atmospheric and marine planetary monitoring.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
