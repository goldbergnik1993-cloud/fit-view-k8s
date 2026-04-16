import { useState } from 'react';
import styles from './Header.module.scss';
import SearchIcon from '../../../assets/icons/search.svg';
import SavedIcon from '../../../assets/icons/saved.svg';
import BagIcon from '../../../assets/icons/bag.svg';
import ProfileIcon from '../../../assets/icons/icon-profile.svg';
import BurgerMenuIcon from '../../../assets/icons/burger-menu.svg';
import BurgerCloseIcon from '../../../assets/icons/burger-close.svg';
import DeliveryIcon from '../../../assets/icons/delivery.svg';
import LogoIcon from '../../../assets/icons/logo.svg';

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'New', children: ['New for Man', 'New for Woman', 'New for Kids'] },
  { label: 'Popular' },
  { label: 'Man' },
  { label: 'Woman' },
  { label: 'Kids' },
];

// ─── Chevron icons ────────────────────────────────────────────────────────────

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m18 15-6-6-6 6" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setExpandedNav(null);
  };

  const toggleNavItem = (label: string) => {
    setExpandedNav(prev => (prev === label ? null : label));
  };

  return (
    <>
      <header className={styles.header} role="banner">
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

          <a href="/" className={styles['header__logo']} aria-label="FitView home">
            <img src={LogoIcon} alt="FitView" width={44} height={44} />
          </a>

          <nav className={styles['header__nav-desktop']} aria-label="Main navigation">
            <ul className={styles['header__nav-desktop-list']} role="list">
              {NAV_ITEMS.map(item => (
                <li key={item.label} className={styles['header__nav-desktop-item']}>
                  <a href={`/catalog?category=${item.label.toLowerCase()}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles['header__icons']} role="group" aria-label="User actions">
          <button className={styles['header__icon-btn']} aria-label="Search">
            <img src={SearchIcon} alt="" aria-hidden="true" width={24} height={24} />
            <span className={styles['header__search-text']}>Search</span>
          </button>
          <a href="/saved" className={styles['header__icon-btn']} aria-label="Saved items">
            <img src={SavedIcon} alt="" aria-hidden="true" width={24} height={24} />
          </a>
          <a href="/my-bag" className={styles['header__icon-btn']} aria-label="Shopping bag">
            <img src={BagIcon} alt="" aria-hidden="true" width={24} height={24} />
          </a>
          <a
            href="/profile"
            className={`${styles['header__icon-btn']} ${styles['header__icon-btn--desktop']}`}
            aria-label="Profile"
          >
            <img src={ProfileIcon} alt="" aria-hidden="true" width={24} height={24} />
          </a>
        </div>
      </header>

      <nav
        id="mobile-nav"
        className={`${styles['mobile-nav']} ${isMenuOpen ? styles['mobile-nav--open'] : ''}`}
        aria-label="Mobile navigation"
        inert={!isMenuOpen ? true : undefined}
      >
        <div className={styles['mobile-nav__header']}>
          <div className={styles['mobile-nav__header-left']}>
            <button
              className={styles['mobile-nav__close']}
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <img src={BurgerCloseIcon} alt="" aria-hidden="true" width={24} height={24} />
            </button>
            <a href="/" className={styles['header__logo']} aria-label="FitView home">
              <img src={LogoIcon} alt="FitView" width={44} height={44} />
            </a>
          </div>
          <div className={styles['header__icons']}>
            <button className={styles['header__icon-btn']} aria-label="Search">
              <img src={SearchIcon} alt="" aria-hidden="true" width={24} height={24} />
            </button>
            <a href="/saved" className={styles['header__icon-btn']} aria-label="Saved items">
              <img src={SavedIcon} alt="" aria-hidden="true" width={24} height={24} />
            </a>
            <a href="/my-bag" className={styles['header__icon-btn']} aria-label="Shopping bag">
              <img src={BagIcon} alt="" aria-hidden="true" width={24} height={24} />
            </a>
          </div>
        </div>

        <ul className={styles['mobile-nav__list']} role="list">
          {NAV_ITEMS.map(item => (
            <li key={item.label} className={styles['mobile-nav__item']}>
              <button
                className={styles['mobile-nav__link']}
                onClick={() => (item.children ? toggleNavItem(item.label) : closeMenu())}
                aria-expanded={item.children ? expandedNav === item.label : undefined}
              >
                {item.label}
                {item.children
                  ? expandedNav === item.label ? <ChevronUp /> : <ChevronRight />
                  : <ChevronRight />
                }
              </button>

              {item.children && expandedNav === item.label && (
                <ul role="list" style={{ listStyle: 'none', padding: '0 0 8px 16px', margin: 0 }}>
                  {item.children.map(child => (
                    <li key={child}>
                      <a
                        href={`/catalog?category=${child.toLowerCase().replace(/ /g, '-')}`}
                        className={styles['mobile-nav__link']}
                        style={{ fontSize: '14px', paddingLeft: 0 }}
                        onClick={closeMenu}
                      >
                        {child}
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
            <a href="/profile" className={styles['mobile-nav__secondary-link']} onClick={closeMenu}>
              <img src={ProfileIcon} alt="" aria-hidden="true" width={24} height={24} />
              Profile
            </a>
          </li>
          <li>
            <a href="/orders" className={styles['mobile-nav__secondary-link']} onClick={closeMenu}>
              <img src={DeliveryIcon} alt="" aria-hidden="true" width={24} height={24} />
              Order Status
            </a>
          </li>
          <li>
            <a href="/help" className={styles['mobile-nav__secondary-link']} onClick={closeMenu}>
              Help
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};