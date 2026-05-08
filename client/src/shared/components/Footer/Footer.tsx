import styles from './Footer.module.scss';
import LogoIcon from '../../../assets/icons/logo.svg';

export const Footer = () => (
  <footer className={styles.footer} role="contentinfo">
    <a href="/" className={styles.footer__logo} aria-label="FitView home">
      <img src={LogoIcon} alt="FitView" width={48} height={48} />
    </a>
    <p className={styles.footer__social}>Follow us on X or Instagram</p>
    <div className={styles.footer__bottom}>
      <ul className={styles.footer__links} role="list">
        <li><span className={styles.footer__link}>Terms of Use</span></li>
        <li><span className={styles.footer__link}>Privacy Police</span></li>
      </ul>
      <p className={styles.footer__contact}>Contact us: mailbox@gmail.com</p>
    </div>
  </footer>
);