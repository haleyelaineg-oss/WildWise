import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata } from 'next'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const loveloBlack = localFont({
  src: './fonts/Lovelo-Black.otf',
  variable: '--font-lovelo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WildWise — Wildlife Rehabilitation Platform',
  description:
    'Connecting Michigan wildlife finders with licensed rehabbers. Get help for injured wildlife fast.',
  metadataBase: new URL('https://bewildwise.org'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} ${loveloBlack.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
