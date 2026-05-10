import styles from './Breadcrumb.module.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index} className={styles.breadcrumb__item}>
          {item.href ? (
            <a href={item.href} className={styles.breadcrumb__link}>
              {item.label}
            </a>
          ) : (
            <span className={styles.breadcrumb__current}>{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className={styles.breadcrumb__sep}>/</span>
          )}
        </span>
      ))}
    </nav>
  );
};