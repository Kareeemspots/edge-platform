'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, PenSquare, CalendarDays, Building2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DashboardSidebarProps {
  persona: 'designer' | 'organizer' | 'club' | null
}

export default function DashboardSidebar({ persona }: DashboardSidebarProps) {
  const pathname = usePathname()

  // Define sidebar links based on persona
  const sidebarLinks = [
    { href: '/', label: 'Startseite', icon: Home },
    ...(persona === 'designer'
      ? [{ href: '/dashboard/designer', label: 'Creative Studio', icon: PenSquare }]
      : persona === 'organizer'
        ? [
            {
              href: '/dashboard/organizer',
              label: 'Event Command Center',
              icon: CalendarDays,
            },
          ]
        : persona === 'club'
          ? [{ href: '/dashboard/club', label: 'Venue OS', icon: Building2 }]
          : []),
    { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-full flex-col p-6">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          EDGE
          <span className="text-xs font-normal text-slate-300">OS</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon as React.ElementType
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900',
                  pathname === link.href && 'bg-slate-100 text-slate-900'
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

