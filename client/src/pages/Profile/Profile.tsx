import { useState } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton'
import AccountDetailsIcon from '../../assets/icons/account-details.svg';
import RulerIcon from '../../assets/icons/ruler.svg';
import BoxIcon from '../../assets/icons/box.svg';
import CreditCardIcon from '../../assets/icons/credit-card.svg';
import LocationIcon from '../../assets/icons/location.svg';
import HeadphonesIcon from '../../assets/icons/headphones.svg';
import InfoIcon from '../../assets/icons/info.svg';
import styles from './Profile.module.scss';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'John Doe',
  phone: '07700 900123',
  birthday: '01/01/2000',
  email: 'john.doe@gmail.com',
};

const MOCK_MEASUREMENTS = {
  shoulders_length_cm: '',
  breast_length_cm: '',
  hips_length_cm: '',
  waist_length_cm: '',
  leg_length_cm: '',
};

// ─── Nav items ────────────────────────────────────────────────────────────────

type TabId = 'personal' | 'measurements' | 'orders' | 'payments' | 'address' | 'help';

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'personal', label: 'Personal Details', icon: AccountDetailsIcon },
  { id: 'measurements', label: 'My Measurements', icon: RulerIcon },
  { id: 'orders', label: 'Orders', icon: BoxIcon },
  { id: 'payments', label: 'Payments', icon: CreditCardIcon },
  { id: 'address', label: 'Address', icon: LocationIcon },
  { id: 'help', label: 'Help', icon: HeadphonesIcon },
];

// ─── Tabs for mobile/tablet (only first 4) ───────────────────────────────────

const MOBILE_TABS: TabId[] = ['personal', 'measurements', 'orders', 'payments'];

// ─── Personal Details Tab ─────────────────────────────────────────────────────

const PersonalDetailsTab = () => (
  <div className={styles['profile__content-inner']}>
    <div className={styles['profile__card']}>
      <h2 className={styles['profile__card-title']}>Details</h2>
      <div className={styles['profile__card-divider']} />
      <div className={styles['profile__card-body']}>
        <p className={styles['profile__card-info']}>Name: {MOCK_USER.name}</p>
        <p className={styles['profile__card-info']}>Phone: {MOCK_USER.phone}</p>
        <p className={styles['profile__card-info']}>Birthday: {MOCK_USER.birthday}</p>
      </div>
      <button className={styles['profile__edit-btn']}>Edit</button>
    </div>

    <div className={styles['profile__card']}>
      <h2 className={styles['profile__card-title']}>Email</h2>
      <div className={styles['profile__card-divider']} />
      <div className={styles['profile__card-body']}>
        <p className={styles['profile__card-info']}>{MOCK_USER.email}</p>
      </div>
      <button className={styles['profile__edit-btn']}>Edit</button>
    </div>

    <div className={styles['profile__card']}>
      <h2 className={styles['profile__card-title']}>Password</h2>
      <div className={styles['profile__card-divider']} />
      <div className={styles['profile__card-body']}>
        <p className={styles['profile__card-info']}>*************</p>
      </div>
      <button className={styles['profile__edit-btn']}>Edit</button>
    </div>
  </div>
);

// ─── Measurement Field ────────────────────────────────────────────────────────

interface MeasurementFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const MeasurementField = ({ label, value, onChange }: MeasurementFieldProps) => (
  <div className={styles['profile__field']}>
    <label className={styles['profile__field-label']}>
      {label}
      <img src={InfoIcon} alt="info" width={16} height={16} className={styles['profile__field-info']} />
    </label>
    <input
      type="number"
      className={styles['profile__field-input']}
      placeholder="0 cm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// ─── Measurements Tab ─────────────────────────────────────────────────────────

const MeasurementsTab = () => {
  const [fields, setFields] = useState(MOCK_MEASUREMENTS);

  const set = (key: keyof typeof fields) => (v: string) =>
    setFields((prev) => ({ ...prev, [key]: v }));

  return (
    <div className={styles['profile__content-inner']}>
      <MeasurementField label="Enter shoulder width (cm)" value={fields.shoulders_length_cm} onChange={set('shoulders_length_cm')} />
      <MeasurementField label="Enter chest girth (cm)" value={fields.breast_length_cm} onChange={set('breast_length_cm')} />
      <MeasurementField label="Enter hip girth (cm)" value={fields.hips_length_cm} onChange={set('hips_length_cm')} />
      <MeasurementField label="Enter waist girth (cm)" value={fields.waist_length_cm} onChange={set('waist_length_cm')} />
      <MeasurementField label="Enter inseam length (cm)" value={fields.leg_length_cm} onChange={set('leg_length_cm')} />
      <PrimaryButton>Save Measurements</PrimaryButton>
    </div>
  );
};

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

const PlaceholderTab = ({ label }: { label: string }) => (
  <div className={styles['profile__content-inner']}>
    <p className={styles['profile__placeholder']}>{label} — coming soon</p>
  </div>
);

// ─── Profile Page ─────────────────────────────────────────────────────────────

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  personal: <PersonalDetailsTab />,
  measurements: <MeasurementsTab />,
  orders: <PlaceholderTab label="Orders" />,
  payments: <PlaceholderTab label="Payments" />,
  address: <PlaceholderTab label="Address" />,
  help: <PlaceholderTab label="Help" />,
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  return (
    <div className={styles['profile-page']}>
      <Header />

      <main className={styles['profile']}>
        <h1 className={styles['profile__title']}>My Profile</h1>

        {/* Mobile / Tablet: horizontal scrollable tabs */}
        <div className={styles['profile__tabs']} role="tablist" aria-label="Profile sections">
          {NAV_ITEMS.filter((item) => MOBILE_TABS.includes(item.id)).map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={activeTab === item.id}
              className={`${styles['profile__tab']} ${activeTab === item.id ? styles['profile__tab--active'] : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles['profile__tab-icon']}>
                <img src={item.icon} alt="" width={20} height={20} />
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop: sidebar + content */}
        <div className={styles['profile__layout']}>
          <aside className={styles['profile__sidebar']}>
            <nav aria-label="Profile navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`${styles['profile__nav-item']} ${activeTab === item.id ? styles['profile__nav-item--active'] : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <span className={styles['profile__nav-icon']}>
                    <img src={item.icon} alt="" width={24} height={24} />
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className={styles['profile__content']}>
            {TAB_CONTENT[activeTab]}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;