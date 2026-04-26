import { useNavigate } from 'react-router-dom';
import styles from './PartnersSection.module.scss';

import zaraLogo from '../../../../assets/brands/zara.svg';
import hmLogo from '../../../../assets/brands/hm.svg';
import northFaceLogo from '../../../../assets/brands/north-face.svg';
import uniqloLogo from '../../../../assets/brands/uniqlo.svg';
import ralphLaurenLogo from '../../../../assets/brands/ralph-lauren.svg';
import mangoLogo from '../../../../assets/brands/mango.svg';
import cosLogo from '../../../../assets/brands/cos.svg';
import balenciagaLogo from '../../../../assets/brands/balenciaga.svg';

const PARTNERS = [
  { id: 1, name: 'Zara', logo: zaraLogo },
  { id: 5, name: 'H&M', logo: hmLogo },
  { id: 7, name: 'The North Face', logo: northFaceLogo },
  { id: 4, name: 'Uniqlo', logo: uniqloLogo },
  { id: 6, name: 'Ralph Lauren', logo: ralphLaurenLogo },
  { id: 2, name: 'Mango', logo: mangoLogo },
  { id: 3, name: 'Cos', logo: cosLogo },
  { id: null, name: 'Balenciaga', logo: balenciagaLogo },
];

export const PartnersSection = () => {
  const navigate = useNavigate();

  const handleClick = (partner: (typeof PARTNERS)[number]) => {
    if (partner.id === null) {
      navigate(
        `/catalog?brand_name=${encodeURIComponent(partner.name)}&empty=true`
      );
    } else {
      navigate(
        `/catalog?brands=${partner.id}&brand_name=${encodeURIComponent(partner.name)}`
      );
    }
  };

  return (
    <section className={styles.section} aria-labelledby="partners-heading">
      <div className={styles['section__header']}>
        <h2 id="partners-heading" className={styles['section__title']}>
          Our partners
        </h2>
      </div>

      <ul className={styles['items-grid']} role="list">
        {PARTNERS.map((partner) => (
          <li key={partner.name}>
            <button
              className={styles['partner-card']}
              onClick={() => handleClick(partner)}
              aria-label={`View ${partner.name} collection`}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={styles['partner-card__logo']}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
