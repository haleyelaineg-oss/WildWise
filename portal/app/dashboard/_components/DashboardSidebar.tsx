'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/types'

type NavItem = {
  label: string
  href: string
  soon?: boolean
}

const REHABBER_NAV: (NavItem | null)[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Cases', href: '/dashboard/my-cases' },
  { label: 'All Open Cases', href: '/dashboard/open-cases' },
  null,
  { label: 'Volunteers', href: '/dashboard/volunteers', soon: true },
  { label: 'Sub-Permittees', href: '/dashboard/sub-permittees', soon: true },
  { label: 'Vet Log', href: '/dashboard/vet-log', soon: true },
  { label: 'Supplies', href: '/dashboard/supplies', soon: true },
  null,
  { label: 'Rehab Management', href: '/dashboard/rehab-management', soon: true },
]

function getNav(role: UserRole): (NavItem | null)[] {
  if (role === 'licensed_rehabber') return REHABBER_NAV
  return []
}

export default function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const nav = getNav(role)

  if (nav.length === 0) return null

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: 'var(--color-white)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--space-5) var(--space-3)',
        position: 'sticky',
        top: 'var(--nav-height)',
        height: 'calc(100dvh - var(--nav-height))',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {nav.map((item, i) => {
          if (item === null) {
            return (
              <div
                key={i}
                style={{
                  height: 1,
                  background: 'var(--color-border)',
                  margin: 'var(--space-2) var(--space-2)',
                }}
              />
            )
          }

          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              onClick={item.soon ? (e) => e.preventDefault() : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'var(--color-navy)' : 'transparent',
                color: isActive
                  ? 'var(--color-cream)'
                  : item.soon
                  ? 'var(--color-text-muted)'
                  : 'var(--color-text)',
                textDecoration: 'none',
                cursor: item.soon ? 'default' : 'pointer',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {item.label}
              {item.soon && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-cream)',
                    border: '1px solid var(--color-border)',
                    padding: '1px 5px',
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
