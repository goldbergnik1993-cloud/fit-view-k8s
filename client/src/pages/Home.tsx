import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import SearchIcon from '../assets/icons/search.svg';
import SavedIcon from '../assets/icons/saved.svg';
import BagIcon from '../assets/icons/bag.svg';
import ProfileIcon from '../assets/icons/icon-profile.svg';
import BurgerMenuIcon from '../assets/icons/burger-menu.svg';
import BurgerCloseIcon from '../assets/icons/burger-close.svg';
import DeliveryIcon from '../assets/icons/delivery.svg';
import LogoIcon from '../assets/icons/logo.svg';
import SilhouetteManImg from '../assets/images/silhouette-man.svg';
import SilhouetteWomanImg from '../assets/images/silhouette-woman.svg';

// ─── Mock data ────────────────────────────────────────────────────────────────

const POPULAR_ITEMS = [
  { id: 1, name: 'Midi dress', icon: 'icon-dress' },
  { id: 2, name: 'Classic Jeans', icon: 'icon-jeans' },
  { id: 3, name: 'Sweater', icon: 'icon-sweater' },
  { id: 4, name: 'Jacket', icon: 'icon-jacket' },
  { id: 5, name: 'Winter Coat', icon: 'icon-coat' },
  { id: 6, name: 'Lightweight Jacket', icon: 'icon-lightweight-jacket' },
  { id: 7, name: 'Overcoat', icon: 'icon-overcoat' },
  { id: 8, name: 'Windbreaker', icon: 'icon-windbreacker' },
];

const PARTNERS = [
  { id: 1, name: 'Zara' },
  { id: 2, name: 'Patagonia' },
  { id: 3, name: 'The North Face' },
  { id: 4, name: 'Mango' },
  { id: 5, name: "Levi's" },
  { id: 6, name: 'Ralph Lauren' },
  { id: 7, name: 'Cos' },
  { id: 8, name: 'Superdry' },
];

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

const Home = () => {
  const navigate = useNavigate();
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
      {/* ── Header ── */}
      <header className={styles.header} role="banner">
        <div className={styles['header__left']}>

          {/* Burger — mobile + tablet */}
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

          {/* Logo */}
          <a href="/" className={styles['header__logo']} aria-label="FitView home">
            <img src={LogoIcon} alt="FitView" width={44} height={44} />
          </a>

          {/* Desktop nav — hidden on mobile/tablet */}
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

        {/* Icons */}
        <div className={styles['header__icons']} role="group" aria-label="User actions">
          <button className={styles['header__icon-btn']} aria-label="Search">
            <img src={SearchIcon} alt="" aria-hidden="true" width={24} height={24} />
            <span className={styles['header__search-text']}>Search</span>
          </button>
          <a href="/saved" className={styles['header__icon-btn']} aria-label="Saved items">
            <img src={SavedIcon} alt="" aria-hidden="true" width={24} height={24} />
          </a>
          <button className={styles['header__icon-btn']} aria-label="Shopping bag">
            <img src={BagIcon} alt="" aria-hidden="true" width={24} height={24} />
          </button>
          {/* Profile — desktop only */}
          <a
            href="/profile"
            className={`${styles['header__icon-btn']} ${styles['header__icon-btn--desktop']}`}
            aria-label="Profile"
          >
            <img src={ProfileIcon} alt="" aria-hidden="true" width={24} height={24} />
          </a>
        </div>
      </header>

      {/* ── Mobile Nav ── */}
      <nav
        id="mobile-nav"
        className={`${styles['mobile-nav']} ${isMenuOpen ? styles['mobile-nav--open'] : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
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
            <button className={styles['header__icon-btn']} aria-label="Shopping bag">
              <img src={BagIcon} alt="" aria-hidden="true" width={24} height={24} />
            </button>
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
                  ? expandedNav === item.label
                    ? <ChevronUp />
                    : <ChevronRight />
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

      <main>
        {/* ── Hero ── */}
        <section className={styles.hero} aria-label="Welcome section">
          <div className={styles['hero__content']}>
            <div className={styles['hero__media']} aria-hidden="true">
              <div className={styles['hero__silhouette']}>
                <img src={SilhouetteManImg} alt="" aria-hidden="true" className={styles['hero__silhouette-img']} />
              </div>
              <div className={styles['hero__silhouette']}>
                <img src={SilhouetteWomanImg} alt="" aria-hidden="true" className={styles['hero__silhouette-img']} />
              </div>
            </div>

            <div className={styles['hero__text']}>
              <h1 className={styles['hero__title']}>
                Find your new favorite style without the hassle
              </h1>
              <p className={styles['hero__description']}>
                Browse our stylish outerwear, enter your body measurements, and try
                items on virtually in seconds. Love the look? Buy with confidence.
              </p>
              <a
                href="/catalog"
                className={styles['hero__cta']}
                aria-label="Start virtual try-on, go to catalog"
              >
                Start Virtual Try-On
              </a>
            </div>
          </div>
        </section>

        {/* ── Popular Items ── */}
        <section className={styles.section} aria-labelledby="popular-items-heading">
          <div className={styles['section__header']}>
            <h2 id="popular-items-heading" className={styles['section__title']}>
              Popular Items
            </h2>
            <a href="/catalog" className={styles['section__see-all']} aria-label="See all popular items">
              See all
            </a>
          </div>

          <ul className={styles['items-grid']} role="list">
            {POPULAR_ITEMS.map(item => (
              <li key={item.id}>
                <button
                  className={styles['item-card']}
                  onClick={() => navigate(`/item/${item.id}`)}
                  aria-label={`View ${item.name}`}
                >
                  <div className={styles['item-card__placeholder']}>
                    <img
                      src={`/src/assets/icons/icon-clothes/${item.icon}.svg`}
                      alt=""
                      aria-hidden="true"
                      className={styles['item-card__icon']}
                      width={16}
                      height={16}
                    />
                    <span className={styles['item-card__name']}>{item.name}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Our Partners ── */}
        <section className={styles.section} aria-labelledby="partners-heading">
          <div className={styles['section__header']}>
            <h2 id="partners-heading" className={styles['section__title']}>
              Our partners
            </h2>
            <button className={styles['section__see-all']} aria-label="See all partners">
              See all
            </button>
          </div>

          <ul className={styles['items-grid']} role="list">
            {PARTNERS.map(partner => (
              <li key={partner.id}>
                <button
                  className={styles['partner-card']}
                  aria-label={`View ${partner.name} collection`}
                >
                  <span className={styles['partner-card__name']}>{partner.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer} role="contentinfo">
        <a href="/" className={styles['footer__logo']} aria-label="FitView home">
          <img src={LogoIcon} alt="FitView" width={48} height={48} />
        </a>
        <p className={styles['footer__social']}>Follow us on X or Instagram</p>
        <nav aria-label="Footer navigation">
          <ul className={styles['footer__links']} role="list">
            <li>
              <a href="/terms" className={styles['footer__link']}>Terms of Use</a>
            </li>
            <li>
              <a href="/privacy" className={styles['footer__link']}>Privacy Policy</a>
            </li>
          </ul>
        </nav>
        <p className={styles['footer__contact']}>
          Contact us:{' '}
          <a href="mailto:mailbox@gmail.com" className={styles['footer__link']}>
            mailbox@gmail.com
          </a>
        </p>
      </footer>
    </>
  );
};

export default Home;