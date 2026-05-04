import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { userApi, type ProfileResponse, type ProfileUpdateData } from '../services/api';
import { UserProfileContext } from './UserProfileContext';

const MOCK_PROFILE: ProfileResponse = {
  id: 1,
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@gmail.com',
  phone_number: '07700 900123',
  birth_date: '01/01/2000',
  height_cm: 170,
  gender: 'female',
  shoulders_length_cm: null,
  breast_length_cm: null,
  waist_length_cm: null,
  hips_length_cm: null,
  leg_length_cm: null,
};

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch {
      setProfile(MOCK_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    try {
      const updated = await userApi.updateProfile(data);
      setProfile(updated);
    } catch {
      setProfile((prev) =>
        prev ? { ...prev, ...data } as ProfileResponse : prev
      );
    }
  }, []);

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, updateProfile, refetch: fetchProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}