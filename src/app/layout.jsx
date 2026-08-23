import './globals.css';
import 'jbx/main.css';

import { GoogleAnalytics } from '@next/third-parties/google';

import GitHubCorner from '@/components/GitHubCorner.jsx';

const TITLE = 'morphin | Create image morphing animations with css!';
const DESCRIPTION = 'Tool that creates animated CSS transitions.';
const CANONICAL = 'https://javier.xyz/morphin';
const THUMBNAIL = 'https://javier.xyz/morphin/thumbnail.jpg';

// Absolute urls throughout: the canonical has to stay javier.xyz/morphin with no
// trailing slash, so nothing is left to url resolution.
export const metadata = {
  metadataBase: new URL('https://javier.xyz'),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'morphin',
    description: DESCRIPTION,
    url: CANONICAL,
    images: [THUMBNAIL],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'morphin',
    description: DESCRIPTION,
    images: [THUMBNAIL],
  },
  appleWebApp: { capable: true },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GitHubCorner />
        <GoogleAnalytics gaId="G-M2FT27FXS2" />
      </body>
    </html>
  );
}
