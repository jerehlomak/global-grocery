'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, DollarSign, FileText, Package,
  AlertCircle, FileCheck, ChevronLeft, ChevronRight,
  LogOut, User, HelpCircle, ShoppingBag
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',      href: '/dashboard',              section: 'overview' },
  { icon: DollarSign,      label: 'Opportunities', href: '/dashboard#opportunities', section: 'opportunities' },
  { icon: FileText,        label: 'Quotes',        href: '/dashboard#quotes',        section: 'quotes' },
  { icon: Package,         label: 'Orders',        href: '/dashboard#orders',        section: 'orders' },
  { icon: AlertCircle,     label: 'Cases',         href: '/dashboard#cases',         section: 'cases' },
  { icon: FileCheck,       label: 'Contracts',     href: '/dashboard#contracts',     section: 'contracts' },
]

const BOTTOM_ITEMS = [
  { icon: ShoppingBag, label: 'Products',     href: '/products' },
  { icon: HelpCircle,  label: 'Help Center',  href: '/help' },
]

export default function DashboardSidebar({ activeSection, onSectionChange }: {
  activeSection?: string
  onSectionChange?: (s: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <>
      <style>{`
        .db-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: ${collapsed ? '72px' : '240px'};
          background: #0f172a;
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          z-index: 50;
          overflow: hidden;
        }
        .db-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '20px 0' : '20px 20px'};
          border-bottom: 1px solid rgba(255,255,255,0.07);
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          min-height: 64px;
        }
        .db-sidebar-logo-mark {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-sidebar-logo-mark img {
          width: 100%; height: 100%;
          object-fit: contain;
        }
        .db-sidebar-logo-text {
          font-size: 15px; font-weight: 700; color: white;
          white-space: nowrap;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
          overflow: hidden;
        }
        .db-sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .db-nav-label {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.3);
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 8px 12px 4px;
          white-space: nowrap;
          display: ${collapsed ? 'none' : 'block'};
        }
        .db-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          color: rgba(255,255,255,0.55);
          font-size: 14px; font-weight: 500;
          white-space: nowrap;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          position: relative;
        }
        .db-nav-item:hover { background: rgba(255,255,255,0.07); color: white; }
        .db-nav-item.active { background: rgba(99,102,241,0.2); color: #a5b4fc; }
        .db-nav-item.active svg { color: #818cf8; }
        .db-nav-item-label { opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; overflow: hidden; }
        .db-collapse-btn {
          position: absolute; top: 50%; right: -12px; transform: translateY(-50%);
          width: 24px; height: 24px;
          background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.6);
          transition: background 0.15s;
          z-index: 51;
        }
        .db-collapse-btn:hover { background: #334155; color: white; }
        .db-sidebar-bottom {
          padding: 12px 8px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; gap: 2px;
        }
        .db-user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
        .db-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .db-user-info { overflow: hidden; opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; }
        .db-user-name { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; }
        .db-user-role { font-size: 11px; color: rgba(255,255,255,0.4); white-space: nowrap; }
        .db-tooltip {
          position: absolute; left: 100%; top: 50%; transform: translateY(-50%);
          margin-left: 12px; background: #1e293b;
          color: white; font-size: 12px; font-weight: 500;
          padding: 5px 10px; border-radius: 6px; white-space: nowrap;
          pointer-events: none; opacity: 0; transition: opacity 0.15s;
          border: 1px solid rgba(255,255,255,0.1);
          display: ${collapsed ? 'block' : 'none'};
        }
        .db-nav-item:hover .db-tooltip { opacity: 1; }
        @media (max-width: 768px) {
          .db-sidebar { width: 72px; }
          .db-nav-item-label, .db-sidebar-logo-text, .db-user-info, .db-nav-label { opacity: 0; }
          .db-nav-item { justify-content: center; }
          .db-user-card { justify-content: center; }
          .db-collapse-btn { display: none; }
          .db-tooltip { display: block; }
        }
      `}</style>

      <div className="db-sidebar">
        {/* Logo — click to go home */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="db-sidebar-logo">
            <div className="db-sidebar-logo-mark">
              <img src="/logo-mark.svg" alt="G" />
            </div>
            <span className="db-sidebar-logo-text">GlobalGrocery</span>
          </div>
        </Link>

        {/* Collapse toggle */}
        <button className="db-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Main Nav */}
        <nav className="db-sidebar-nav">
          <div className="db-nav-label">Menu</div>
          {NAV_ITEMS.map(item => (
            <div
              key={item.section}
              className={`db-nav-item${activeSection === item.section ? ' active' : ''}`}
              onClick={() => onSectionChange?.(item.section)}
            >
              <item.icon size={18} />
              <span className="db-nav-item-label">{item.label}</span>
              <span className="db-tooltip">{item.label}</span>
            </div>
          ))}

          <div className="db-nav-label" style={{ marginTop: 8 }}>More</div>
          {BOTTOM_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className="db-nav-item">
              <item.icon size={18} />
              <span className="db-nav-item-label">{item.label}</span>
              <span className="db-tooltip">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom user + logout */}
        <div className="db-sidebar-bottom">
          <div className="db-user-card">
            <div className="db-user-avatar">{initials}</div>
            <div className="db-user-info">
              <div className="db-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="db-user-role">Customer</div>
            </div>
          </div>
          <div className="db-nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
            <LogOut size={18} />
            <span className="db-nav-item-label">Sign Out</span>
            <span className="db-tooltip">Sign Out</span>
          </div>
        </div>
      </div>
    </>
  )
}
