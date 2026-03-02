import { Libertinus_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { defaultMetadata } from '@/lib/seo';

const libertinusMono = Libertinus_Mono({
  subsets: ['latin'],
  weight: '400',  // Solo tiene un peso disponible
  display: 'swap',
});

export const metadata = defaultMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${libertinusMono.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}