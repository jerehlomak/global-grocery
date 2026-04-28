'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Routes where the global Navbar and Footer should NOT render
const NO_SHELL_ROUTES = ['/dashboard']

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideShell = NO_SHELL_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))

  return (
    <>
      {!hideShell && <Navbar />}
      {children}
      {!hideShell && <Footer />}
    </>
  )
}
