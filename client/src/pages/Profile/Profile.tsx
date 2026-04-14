import { useState} from 'react';
import { useAuth } from '../../hooks/useAuth';
import { request } from '../../services/api';

interface ProfileData {
  height_cm: number;
  gender: 'male' | 'female' | 'unisex';
  leg_length_cm: number;
  waist_length_cm: number;
}

const GENDER_OPTIONS: { label: string; value: ProfileData['gender'] }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Unisex', value: 'unisex' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState<ProfileData>({
    height_cm: 165,
    gender: 'female',
    leg_length_cm: 80,
    waist_length_cm: 70,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(form),
      }, true);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1>Profile</h1>
      {user && (
        <p style={{ color: '#666', marginBottom: '24px' }}>{user.email}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Gender */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
            Gender
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {GENDER_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleChange('gender', value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #534AB7',
                  background: form.gender === value ? '#534AB7' : 'white',
                  color: form.gender === value ? 'white' : '#534AB7',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
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
          <input
            type="range"
            min={140}
            max={210}
            value={form.height_cm}
            onChange={e => handleChange('height_cm', Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Leg length */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Leg length: {form.leg_length_cm} cm
          </label>
          <input
            type="range"
            min={60}
            max={110}
            value={form.leg_length_cm}
            onChange={e => handleChange('leg_length_cm', Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Waist length */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Waist length: {form.waist_length_cm} cm
          </label>
          <input
            type="range"
            min={50}
            max={120}
            value={form.waist_length_cm}
            onChange={e => handleChange('waist_length_cm', Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px',
            background: '#fff0f0',
            border: '1px solid #ffcccc',
            borderRadius: '8px',
            color: '#cc0000',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            padding: '12px',
            background: '#f0fff0',
            border: '1px solid #ccffcc',
            borderRadius: '8px',
            color: '#007700',
            fontSize: '13px',
          }}>
            Profile saved successfully!
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: '#534AB7',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            background: 'white',
            color: '#666',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>

      </div>
    </div>
  );
};

export default Profile;