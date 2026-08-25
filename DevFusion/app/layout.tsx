import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ComplianceProvider } from '@/lib/complianceContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SIH034 - Packaged Commodity Compliance Platform',
  description:
    'AI-assisted label screening and evidence-based compliance checking under Legal Metrology (Packaged Commodities) Rules.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-background font-sans antialiased">
        <ComplianceProvider>{children}</ComplianceProvider>
      </body>
    </html>
  );
}
