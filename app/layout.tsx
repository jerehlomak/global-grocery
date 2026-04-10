import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import LiveChatPlaceholder from '@/components/shared/LiveChatPlaceholder'

export const metadata: Metadata = {
  title: 'GlobalGrocery  Enterprise Grocery eCommerce',
  description: 'A Salesforce-powered global grocery eCommerce platform. Shop fresh, regional pricing, enterprise features.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ background: '#f8f9fc', color: '#0f172a' }}>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main style={{ minHeight: '80vh' }}>{children}</main>
          <Footer />
          <LiveChatPlaceholder />
        </Providers>
      </body>
    </html>
  )
}
