import { Inter, Martian_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const martianMono = Martian_Mono({ subsets: ['latin'], variable: '--font-martian' });

export const metadata = {
  title: 'Colegio - Institución Educativa',
  description: 'Sitio web oficial de la Institución Educativa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${martianMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}