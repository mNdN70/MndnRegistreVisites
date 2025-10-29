import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { LanguageProvider } from '@/hooks/use-translation';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'MENADIONA',
  description: 'Control de visitas de una empresa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        <LanguageProvider>
            <FirebaseErrorListener />
            <Header />
            <main className="flex-grow">
            {children}
            </main>
            <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
