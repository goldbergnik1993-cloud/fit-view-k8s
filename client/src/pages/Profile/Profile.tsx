import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userApi, type ProfileData } from '../../services/api';

const DEFAULT_FORM: ProfileData = {
  height_cm: 165,
  gender: 'female',
  shoulders_length_cm: 40,
  breast_length_cm: 90,
  waist_length_cm: 70,
  hips_length_cm: 95,
  leg_length_cm: 80,
};

const GENDER_OPTIONS: { label: string; value: NonNullable<ProfileData['gender']> }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Unisex', value: 'unisex' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState<ProfileData>(DEFAULT_FORM);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile
  useEffect(() => {
    userApi.getProfile()
      .then((profile) => {
        setForm({
          height_cm: profile.height_cm,
          gender: profile.gender,
          shoulders_length_cm: profile.shoulders_length_cm,
          breast_length_cm: profile.breast_length_cm,
          waist_length_cm: profile.waist_length_cm,
          hips_length_cm: profile.hips_length_cm,
          leg_length_cm: profile.leg_length_cm,
        });
        setProfileExists(true);
      })
      .catch(() => {
        setProfileExists(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (profileExists) {
        await userApi.updateProfile(form);
      } else {
        await userApi.createProfile(form);
        setProfileExists(true);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1>Profile</h1>
      {user && <p style={{ color: '#666', marginBottom: '24px' }}>{user.email}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Gender */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px' }}>Gender</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {GENDER_OPTIONS.map(({ label, value }) => (
              <button key={value} onClick={() => handleChange('gender', value)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  border: '1px solid #534AB7',
                  background: form.gender === value ? '#534AB7' : 'white',
                  color: form.gender === value ? 'white' : '#534AB7',
                  cursor: 'pointer', fontSize: '13px',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Height: {form.height_cm} cm
          </label>
          <input type="range" min={100} max={250} value={form.height_cm}
            onChange={e => handleChange('height_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {/* Shoulders */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Shoulders: {form.shoulders_length_cm} cm
          </label>
          <input type="range" min={30} max={60} value={form.shoulders_length_cm}
            onChange={e => handleChange('shoulders_length_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {/* Breast */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Breast: {form.breast_length_cm} cm
          </label>
          <input type="range" min={60} max={180} value={form.breast_length_cm}
            onChange={e => handleChange('breast_length_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {/* Waist */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Waist: {form.waist_length_cm} cm
          </label>
          <input type="range" min={40} max={150} value={form.waist_length_cm}
            onChange={e => handleChange('waist_length_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {/* Hips */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Hips: {form.hips_length_cm} cm
          </label>
          <input type="range" min={60} max={180} value={form.hips_length_cm}
            onChange={e => handleChange('hips_length_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {/* Leg */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Leg length: {form.leg_length_cm} cm
          </label>
          <input type="range" min={50} max={120} value={form.leg_length_cm}
            onChange={e => handleChange('leg_length_cm', Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', color: '#cc0000', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', background: '#f0fff0', border: '1px solid #ccffcc', borderRadius: '8px', color: '#007700', fontSize: '13px' }}>
            Profile saved successfully!
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#534AB7', color: 'white', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>

        <button onClick={logout}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', background: 'white', color: '#666', fontSize: '15px', cursor: 'pointer' }}>
          Log Out
        </button>

      </div>
    </div>
  );
};

export default Profile;