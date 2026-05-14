'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const NAV_LINKS = [
  { href: '/learn', label: 'Learn' },
  { href: '/verify', label: 'Verify a Rehabber' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    closeMenu()
    router.push('/')
  }

  return (
    <>
      <nav className={`nav nav--dark${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" onClick={closeMenu}>
            <Image
              src="/assets/icons/hand-paw-light.svg"
              alt=""
              width={64}
              height={64}
              className="nav__logo-mark"
              priority
            />
            <span className="nav__logo-text">
              <span className="wild">WILD</span>
              <span className="wise">WISE</span>
            </span>
          </Link>

          <div className="nav__links">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav__link${pathname === href ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="nav__dropdown" ref={dropdownRef}>
                <button
                  className={`nav__link nav__dropdown-trigger${pathname.startsWith('/dashboard') ? ' active' : ''}`}
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  Dashboard
                  <ChevronDownIcon
                    className={`nav__dropdown-chevron${dropdownOpen ? ' open' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {dropdownOpen && (
                  <div className="nav__dropdown-menu" role="menu">
                    <Link
                      href="/dashboard"
                      className="nav__dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      className="nav__dropdown-item nav__dropdown-item--signout"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`nav__link${pathname === '/login' ? ' active' : ''}`}
              >
                Login
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link href="/found-an-animal" className="btn-primary nav__cta" onClick={closeMenu}>
              Found an Animal
            </Link>

            <button
              className={`nav__hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`nav__mobile${menuOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Mobile menu"
      >
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav__mobile-link${pathname === href ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className={`nav__mobile-link${pathname.startsWith('/dashboard') ? ' active' : ''}`}
              onClick={closeMenu}
            >
              My Dashboard
            </Link>
            <button
              className="nav__mobile-link nav__mobile-signout"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className={`nav__mobile-link${pathname === '/login' ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Login
          </Link>
        )}
        <Link href="/found-an-animal" className="btn-primary nav__mobile-cta" onClick={closeMenu}>
          Found an Animal
        </Link>
      </div>
    </>
  )
}
