import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import AccountDetailsIcon from '../../assets/icons/account-details.svg';
import RulerIcon from '../../assets/icons/ruler.svg';
import BoxIcon from '../../assets/icons/box.svg';
import CreditCardIcon from '../../assets/icons/credit-card.svg';
import LocationIcon from '../../assets/icons/location.svg';
import HeadphonesIcon from '../../assets/icons/headphones.svg';
import {
  MeasurementFields,
  type MeasurementValues,
} from '../../shared/components/MeasurementFields/MeasurementFields';
import { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { ProfileResponse } from '../../services/api';
import styles from './Profile.module.scss';

// ─── Nav items ────────────────────────────────────────────────────────────────

type TabId =
  | 'personal'
  | 'measurements'
  | 'orders'
  | 'payments'
  | 'address'
  | 'help';

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

// ─── Personal Details Tab ─────────────────────────────────────────────────────

const PersonalDetailsTab = ({ profile }: { profile: ProfileResponse }) => (
  <div className={styles['profile__content-inner']}>
    <div className={styles['profile__card']}>
      <h2 className={styles['profile__card-title']}>Details</h2>
      <div className={styles['profile__card-divider']} />
      <div className={styles['profile__card-body']}>
        <p className={styles['profile__card-info']}>
          Name: {profile.first_name} {profile.last_name}
        </p>
        <p className={styles['profile__card-info']}>
          Phone: {profile.phone_number}
        </p>
        <p className={styles['profile__card-info']}>
          Birthday: {profile.birth_date ?? '—'}
        </p>
      </div>
      <button className={styles['profile__edit-btn']}>Edit</button>
    </div>

    <div className={styles['profile__card']}>
      <h2 className={styles['profile__card-title']}>Email</h2>
      <div className={styles['profile__card-divider']} />
      <div className={styles['profile__card-body']}>
        <p className={styles['profile__card-info']}>{profile.email}</p>
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

// ─── Measurements Tab ─────────────────────────────────────────────────────────

const MeasurementsTab = ({ profile }: { profile: ProfileResponse }) => {
  const { updateProfile } = useUserProfile();

  const [fields, setFields] = useState<MeasurementValues>({
    shoulders_length_cm: profile.shoulders_length_cm ?? 0,
    breast_length_cm: profile.breast_length_cm ?? 0,
    hips_length_cm: profile.hips_length_cm ?? 0,
    waist_length_cm: profile.waist_length_cm ?? 0,
    leg_length_cm: profile.leg_length_cm ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof MeasurementValues, raw: string) => {
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    setFields((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        shoulders_length_cm: fields.shoulders_length_cm || null,
        breast_length_cm: fields.breast_length_cm || null,
        hips_length_cm: fields.hips_length_cm || null,
        waist_length_cm: fields.waist_length_cm || null,
        leg_length_cm: fields.leg_length_cm || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles['profile__content-inner']}>
      <div className={styles['profile__card']}>
        <div className={styles['profile__fields']}>
          <MeasurementFields
            values={fields}
            onChange={handleChange}
            fieldClassName={styles['profile__field']}
            fieldLabelClassName={styles['profile__field-label']}
            infoBtnClassName={styles['profile__field-info-btn']}
            tooltipClassName={styles['profile__field-tooltip']}
            inputClassName={styles['profile__field-input']}
          />
        </div>
        <PrimaryButton onClick={handleSave} loading={saving} disabled={saved}>
          {saved ? 'Saved' : 'Save Measurements'}
        </PrimaryButton>
      </div>
    </div>
  );
};

// ─── Placeholder tabs ─────────────────────────────────────────────────────────

const PlaceholderTab = ({ label }: { label: string }) => (
  <div className={styles['profile__content-inner']}>
    <p className={styles['profile__placeholder']}>{label} — coming soon</p>
  </div>
);

// ─── Tab content map ──────────────────────────────────────────────────────────

const getTabContent = (
  tab: TabId,
  profile: ProfileResponse | null
): React.ReactNode => {
  if (!profile) return null;
  const map: Record<TabId, React.ReactNode> = {
    personal: <PersonalDetailsTab profile={profile} />,
    measurements: <MeasurementsTab profile={profile} />,
    orders: <PlaceholderTab label="Orders" />,
    payments: <PlaceholderTab label="Payments" />,
    address: <PlaceholderTab label="Address" />,
    help: <PlaceholderTab label="Help" />,
  };
  return map[tab];
};

// ─── Profile Page ─────────────────────────────────────────────────────────────

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const { profile, loading } = useUserProfile();

  return (
    <div className={styles['profile-page']}>
      <Header />

      <main className={styles['profile']}>
        <h1 className={styles['profile__title']}>My Profile</h1>

        <div
          className={styles['profile__tabs']}
          role="tablist"
          aria-label="Profile sections"
        >
          {NAV_ITEMS.map((item) => (
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

        <div className={styles['profile__layout']}>
          <aside className={styles['profile__sidebar']}>
            <div className={styles['profile__sidebar-card']}>
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
            </div>
          </aside>

          <div className={styles['profile__content']}>
            {loading ? null : getTabContent(activeTab, profile)}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
