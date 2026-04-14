import styles from './Footer.module.scss';
import LogoIcon from '../../../assets/icons/logo.svg';

export const Footer = () => (
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
);