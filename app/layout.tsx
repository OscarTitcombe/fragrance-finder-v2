import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fragrance Finder',
  description: 'Find your perfect fragrance match.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-gradient-to-b from-white to-gray-100 text-black', inter.className)}>
        <header className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-gray-200 backdrop-blur-md flex gap-6 text-sm font-semibold px-4 py-3">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/quiz/1" className="hover:underline">Quiz</Link>
          <Link href="/results" className="hover:underline">Results</Link>
          <Link href="/articles/sample-post" className="hover:underline">Articles</Link>
        </header>
        <div className="h-16" /> {/* Spacer for fixed navbar */}
        <main className="pt-4 max-w-3xl mx-auto p-6">{children}</main>
        <Script
          src="https://www.anrdoezrs.net/am/101457651/include/allCj/impressions/page/am.js"
          strategy="afterInteractive"
        />
        <Analytics />
      </body>
    </html>
  )
}

