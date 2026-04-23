import { useState } from 'react';
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

const NAV_ITEMS = [
  { label: 'New', children: ['New for Man', 'New for Woman'] },
  { label: 'Popular' },
  { label: 'Man' },
  { label: 'Woman' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isMobile } = useBreakpoint();
  const { user } = useAuth();

  const profileHref = user ? '/profile' : '/login';

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

  return (
    <>
      <header className={styles.header} role="banner">
        {/* Tablet/Desktop — active search: show SearchBar inside header */}
        {!isMobile && isSearchOpen ? (
          <>
            <div className={styles['header__left']}>
              {/* burger for tablet  */}
              <button
                className={styles['header__burger']}
                onClick={toggleMenu}
                aria-label="Open menu"
                aria-controls="mobile-nav"
              >
                <img
                  src={BurgerMenuIcon}
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
              >
                <img src={LogoIcon} alt="FitView" width={44} height={44} />
              </a>

              {/* desktop navigation */}
              <nav
                className={styles['header__nav-desktop']}
                aria-label="Main navigation"
              >
                <ul className={styles['header__nav-desktop-list']} role="list">
                  {NAV_ITEMS.map((item) => (
                    <li
                      key={item.label}
                      className={styles['header__nav-desktop-item']}
                    >
                      <a href="/catalog">{item.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* SearchBar centered */}
            <div className={styles['header__search-active']}>
              <SearchBar onClose={closeSearch} />
            </div>

            <div
              className={styles['header__icons']}
              role="group"
              aria-label="User actions"
            >
              <a
                href="/saved"
                className={styles['header__icon-btn']}
                aria-label="Saved items"
              >
                <img
                  src={SavedIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
              <a
                href="/my-bag"
                className={styles['header__icon-btn']}
                aria-label="Shopping bag"
              >
                <img
                  src={BagIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
              <a
                href={profileHref}
                className={`${styles['header__icon-btn']} ${styles['header__icon-btn--desktop']}`}
                aria-label="Profile"
              >
                <img
                  src={ProfileIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
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
              >
                <img src={LogoIcon} alt="FitView" width={44} height={44} />
              </a>

              <nav
                className={styles['header__nav-desktop']}
                aria-label="Main navigation"
              >
                <ul className={styles['header__nav-desktop-list']} role="list">
                  {NAV_ITEMS.map((item) => (
                    <li
                      key={item.label}
                      className={styles['header__nav-desktop-item']}
                    >
                      <a href="/catalog">{item.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div
              className={styles['header__icons']}
              role="group"
              aria-label="User actions"
            >
              <button
                className={styles['header__icon-btn']}
                aria-label="Search"
                onClick={openSearch}
              >
                <img
                  src={SearchIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
                <span className={styles['header__search-text']}>Search</span>
              </button>
              <a
                href="/saved"
                className={styles['header__icon-btn']}
                aria-label="Saved items"
              >
                <img
                  src={SavedIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
              <a
                href="/my-bag"
                className={styles['header__icon-btn']}
                aria-label="Shopping bag"
              >
                <img
                  src={BagIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
              <a
                href={profileHref}
                className={`${styles['header__icon-btn']} ${styles['header__icon-btn--desktop']}`}
                aria-label="Profile"
              >
                <img
                  src={ProfileIcon}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
              </a>
            </div>
          </>
        )}
      </header>

      {/* Mobile menu */}
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
              <img
                src={BurgerCloseIcon}
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
            >
              <img src={LogoIcon} alt="FitView" width={44} height={44} />
            </a>
          </div>
          <div className={styles['header__icons']}>
            <button
              className={styles['header__icon-btn']}
              aria-label="Search"
              onClick={() => {
                closeMenu();
                openSearch();
              }}
            >
              <img
                src={SearchIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </button>
            <a
              href="/saved"
              className={styles['header__icon-btn']}
              aria-label="Saved items"
            >
              <img
                src={SavedIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </a>
            <a
              href="/my-bag"
              className={styles['header__icon-btn']}
              aria-label="Shopping bag"
            >
              <img
                src={BagIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </a>
          </div>
        </div>

        <ul className={styles['mobile-nav__list']} role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className={styles['mobile-nav__item']}>
              <button
                className={styles['mobile-nav__link']}
                onClick={() => {
                  if (item.children) {
                    toggleNavItem(item.label);
                  } else {
                    window.location.href = '/catalog';
                    closeMenu();
                  }
                }}
                aria-expanded={
                  item.children ? expandedNav === item.label : undefined
                }
              >
                {item.label}
                <img
                  src={
                    expandedNav === item.label
                      ? ChevronUpIcon
                      : ChevronRightIcon
                  }
                  alt=""
                  aria-hidden="true"
                  width={16}
                  height={16}
                />
              </button>

              {item.children && expandedNav === item.label && (
                <ul
                  role="list"
                  style={{
                    listStyle: 'none',
                    padding: '0 0 8px 16px',
                    margin: 0,
                  }}
                >
                  {item.children.map((child) => (
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
            <a
              href={profileHref}
              className={styles['mobile-nav__secondary-link']}
              onClick={closeMenu}
            >
              <img
                src={ProfileIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
              Profile
            </a>
          </li>
        </ul>
      </nav>

      {/* Mobile search — fullscreen */}
      {isMobile && (
        <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </>
  );
};
