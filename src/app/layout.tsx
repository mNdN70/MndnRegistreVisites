import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { LanguageProvider } from '@/hooks/use-translation';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { VisitsProvider } from '@/contexts/VisitsContext';

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
          <FirebaseClientProvider>
            <ConfigProvider>
              <VisitsProvider>
                <Header />
                <main className="flex-grow">
                {children}
                </main>
                <Toaster />
              </VisitsProvider>
            </ConfigProvider>
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
