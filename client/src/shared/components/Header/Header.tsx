import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.scss';
import SearchIcon from '../../../assets/icons/search.svg';
import SavedIcon from '../../../assets/icons/saved.svg';
import BagIcon from '../../../assets/icons/bag.svg';
import ProfileIcon from '../../../assets/icons/icon-profile.svg';
import BurgerMenuIcon from '../../../assets/icons/burger-menu.svg';
import BurgerCloseIcon from '../../../assets/icons/burger-close.svg';
import LogoIcon from '../../../assets/icons/logo.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right.svg';
import ChevronUpIcon from '../../../assets/icons/chevron-up.svg';
import { SearchOverlay } from '../SearchOverlay/SearchOverlay';
import { SearchBar } from '../SearchOverlay/SearchBar';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useAuth } from '../../../hooks/useAuth';
import { useFavorites } from '../../../providers/FavoritesContext';
import { useCart } from '../../../providers/CartContext';

const NAV_ITEMS = [
  {
    label: 'New',
    children: [
      {
        label: 'New for Man',
        href: '/catalog?sort_by=new&gender=male&breadcrumb_name=New+for+Man',
      },
      {
        label: 'New for Woman',
        href: '/catalog?sort_by=new&gender=female&breadcrumb_name=New+for+Woman',
      },
    ],
  },
  {
    label: 'Popular',
    href: '/catalog?sort_by=popular&breadcrumb_name=Popular',
  },
  { label: 'Man', href: '/catalog?gender=male&breadcrumb_name=Man' },
  { label: 'Woman', href: '/catalog?gender=female&breadcrumb_name=Woman' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { count: favCount } = useFavorites();
  const { count: cartCount } = useCart();
  const { isMobile } = useBreakpoint();
  const { user } = useAuth();
  const location = useLocation();

  const profileHref = user ? '/profile' : '/login';
  const isOnSaved = location.pathname === '/saved';
  const isOnBag = location.pathname === '/my-bag';

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setExpandedNav(null);
  };
  const toggleNavItem = (label: string) => {
    setExpandedNav((prev) => (prev === label ? null : label));
  };
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // ─── Reusable icon nodes ────────────────────────────────────────────────────

  const savedIcon = (
    <a
      href="/saved"
      className={[
        styles['header__icon-btn'],
        isOnSaved ? styles['header__icon-btn--active'] : '',
      ].filter(Boolean).join(' ')}
      aria-label="Saved items"
    >
      <div className={styles['header__icon-wrapper']}>
        <img src={SavedIcon} alt="" aria-hidden="true" width={24} height={24} />
        {favCount > 0 && (
          <span className={styles['header__badge']}>{favCount}</span>
        )}
      </div>
    </a>
  );

  const bagIcon = (
    <a
      href="/my-bag"
      className={[
        styles['header__icon-btn'],
        isOnBag ? styles['header__icon-btn--active'] : '',
      ].filter(Boolean).join(' ')}
      aria-label="Shopping bag"
    >
      <div className={styles['header__icon-wrapper']}>
        <img src={BagIcon} alt="" aria-hidden="true" width={24} height={24} />
        {cartCount > 0 && (
          <span className={styles['header__badge']}>{cartCount}</span>
        )}
      </div>
    </a>
  );

  const profileIcon = (
    <a
      href={profileHref}
      className={[
        styles['header__icon-btn'],
        styles['header__icon-btn--desktop'],
      ].join(' ')}
      aria-label="Profile"
    >
      <img src={ProfileIcon} alt="" aria-hidden="true" width={24} height={24} />
    </a>
  );

  return (
    <>
      <header className={styles.header} role="banner">
        {!isMobile && isSearchOpen ? (
          <>
            <div className={styles['header__left']}>
              <button
                className={styles['header__burger']}
                onClick={toggleMenu}
                aria-label="Open menu"
                aria-controls="mobile-nav"
              >
                <img src={BurgerMenuIcon} alt="" aria-hidden="true" width={24} height={24} />
              </button>

              <a
                href="/"
                className={styles['header__logo']}
                aria-label="FitView home"
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <img src={LogoIcon} alt="FitView" width={44} height={44} />
              </a>

              <nav className={styles['header__nav-desktop']} aria-label="Main navigation">
                <ul className={styles['header__nav-desktop-list']} role="list">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.label} className={styles['header__nav-desktop-item']}>
                      <a href={item.href ?? '/catalog'}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className={styles['header__search-active']}>
              <SearchBar onClose={closeSearch} />
            </div>

            <div className={styles['header__icons']} role="group" aria-label="User actions">
              {savedIcon}
              {bagIcon}
              {profileIcon}
            </div>
          </>
        ) : (
          <>
            <div className={styles['header__left']}>
              <button
                className={styles['header__burger']}
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav"
              >
                <img
                  src={isMenuOpen ? BurgerCloseIcon : BurgerMenuIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </button>

              <a
                href="/"
                className={styles['header__logo']}
                aria-label="FitView home"
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <img src={LogoIcon} alt="FitView" width={44} height={44} />
              </a>

              <nav className={styles['header__nav-desktop']} aria-label="Main navigation">
                <ul className={styles['header__nav-desktop-list']} role="list">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.label} className={styles['header__nav-desktop-item']}>
                      <a href={item.href ?? '/catalog'}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className={styles['header__icons']} role="group" aria-label="User actions">
              <button
                className={styles['header__icon-btn']}
                aria-label="Search"
                onClick={openSearch}
              >
                <img src={SearchIcon} alt="" aria-hidden="true" width={24} height={24} />
                <span className={styles['header__search-text']}>Search</span>
              </button>
              {savedIcon}
              {bagIcon}
              {profileIcon}
            </div>
          </>
        )}

        {isMenuOpen && (
          <div
            className={styles['mobile-nav__backdrop']}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        <nav
          id="mobile-nav"
          className={[
            styles['mobile-nav'],
            isMenuOpen ? styles['mobile-nav--open'] : '',
          ].filter(Boolean).join(' ')}
          aria-label="Mobile navigation"
          inert={!isMenuOpen}
        >
          <ul className={styles['mobile-nav__list']} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className={styles['mobile-nav__item']}>
                <button
                  className={styles['mobile-nav__link']}
                  onClick={() => {
                    if (item.children) {
                      toggleNavItem(item.label);
                    } else {
                      window.location.href = item.href ?? '/catalog';
                      closeMenu();
                    }
                  }}
                  aria-expanded={item.children ? expandedNav === item.label : undefined}
                >
                  {item.label}
                  <img
                    src={expandedNav === item.label ? ChevronUpIcon : ChevronRightIcon}
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                  />
                </button>

                {item.children && expandedNav === item.label && (
                  <ul role="list" className={styles['mobile-nav__children']}>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className={styles['mobile-nav__child-link']}
                          onClick={closeMenu}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className={styles['mobile-nav__divider']} role="separator" />

          <ul className={styles['mobile-nav__secondary']} role="list">
            <li>
              <a
                href={profileHref}
                className={styles['mobile-nav__secondary-link']}
                onClick={closeMenu}
              >
                <img src={ProfileIcon} alt="" aria-hidden="true" width={24} height={24} />
                Profile
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {isMobile && (
        <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </>
  );
};