import { DM_Sans, Syne, Martian_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/next';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian',
  weight: ['400', '500', '700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://colegio.edu.co';
const SITE_NAME = 'Institución Educativa';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Rivera, Huila`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Sitio web oficial de la Institución Educativa. Actividades, noticias, eventos y recursos educativos para nuestra comunidad en Rivera, Huila.',
  keywords: ['institución educativa', 'colegio', 'Rivera', 'Huila', 'Colombia', 'educación', 'escuela'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Rivera, Huila`,
    description:
      'Sitio web oficial de la Institución Educativa. Actividades, noticias y recursos para nuestra comunidad.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Rivera, Huila`,
    description: 'Sitio web oficial de la Institución Educativa en Rivera, Huila.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${syne.variable} ${martianMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
