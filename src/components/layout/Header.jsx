import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'

import Container from '../ui/Container.jsx'
import IconButton from '../ui/IconButton.jsx'
import styles from './Header.module.css'
import { useCartStore } from '../../hooks/useCartStore.js'
import { useWishlistStore } from '../../hooks/useWishlistStore.js'

const navItems = [
  { to: '/customize-tea', label: 'Customize Tea', tone: 'accent' },
  { to: '/products', label: 'Products' },
  { to: '/gifts', label: 'Gifts' },
  { to: '/offers', label: 'Offers' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const searchInputRef = useRef(null)

  const cartItems = useCartStore((s) => s.items)
  const wishlistIds = useWishlistStore((s) => s.ids)

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
    [cartItems],
  )

  useEffect(() => {
    setIsMobileOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isSearchOpen) return
    searchInputRef.current?.focus?.()
  }, [isSearchOpen])

  function onSearchSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const query = String(form.get('q') ?? '').trim()
    navigate(`/products${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  const linkClassName = (tone) => ({ isActive }) =>
    `${styles.navLink} ${tone === 'accent' ? styles.navLinkAccent : ''} ${isActive ? styles.navLinkActive : ''}`

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="MANOR home">
          <img className={styles.logo} src="/ManorLogo.png" alt="" />
          <span className={styles.brandText}>
            <span className={styles.wordmark}>MANOR</span>
            <span className={styles.tagline}>The Tea of Your Morning</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((i) => (
            <NavLink key={i.to} to={i.to} className={linkClassName(i.tone)}>
              {i.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <IconButton
            label={isSearchOpen ? 'Close search' : 'Search products'}
            variant="soft"
            onClick={() => setIsSearchOpen((v) => !v)}
          >
            <Search size={18} />
          </IconButton>

          <Link className={styles.iconLink} to="/favourites" aria-label="Favourites">
            <IconButton label="Favourites" variant="soft">
              <Heart size={18} />
            </IconButton>
            {wishlistIds.length > 0 && <span className={styles.badge}>{wishlistIds.length}</span>}
          </Link>

          <Link className={styles.iconLink} to="/cart" aria-label="Cart">
            <IconButton label="Cart" variant="soft">
              <ShoppingBag size={18} />
            </IconButton>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          <IconButton
            label={isMobileOpen ? 'Close menu' : 'Open menu'}
            className={styles.mobileToggle}
            variant="soft"
            aria-expanded={isMobileOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </IconButton>
        </div>
      </Container>

      {isSearchOpen && (
        <div className={styles.searchPanel}>
          <Container>
            <form className={styles.searchForm} onSubmit={onSearchSubmit}>
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                name="q"
                placeholder="Search teas, hampers, flavours…"
                autoComplete="off"
              />
              <button className={styles.searchButton} type="submit">
                Search
              </button>
            </form>
          </Container>
        </div>
      )}

      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          role="dialog"
          aria-modal="true"
          id="mobile-menu"
          onClick={() => setIsMobileOpen(false)}
        >
          <aside className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileHeader}>
              <div className={styles.mobileTitle}>Menu</div>
              <IconButton label="Close" variant="soft" onClick={() => setIsMobileOpen(false)}>
                <X size={18} />
              </IconButton>
            </div>

            <div className={styles.mobileLinks}>
              {navItems.map((i) => (
                <NavLink key={i.to} to={i.to} className={linkClassName(i.tone)}>
                  {i.label}
                </NavLink>
              ))}
              <NavLink to="/track-order" className={linkClassName()}>
                Track Order
              </NavLink>
              <NavLink to="/helpdesk" className={linkClassName()}>
                Helpdesk
              </NavLink>
              <NavLink to="/payments" className={linkClassName()}>
                Payments Info
              </NavLink>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
