import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Note App',
  description: 'AI의 도움을 받는 나만의 노트 정리 웹 애플리케이션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
