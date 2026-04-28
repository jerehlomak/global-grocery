import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import ShellWrapper from '@/components/layout/ShellWrapper'
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
          <ShellWrapper>
            <CartDrawer />
            <main style={{ minHeight: '80vh' }}>{children}</main>
            <LiveChatPlaceholder />
          </ShellWrapper>
        </Providers>
      </body>
    </html>
  )
}
