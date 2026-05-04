import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  userApi,
  tokenStorage,
  type ProfileResponse,
  type ProfileUpdateData,
} from '../services/api';
import { UserProfileContext } from './UserProfileContext';

const GUEST_STORAGE_KEY = 'guest_measurements';

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

const GUEST_PROFILE: ProfileResponse = {
  id: 0,
  user_id: 0,
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  birth_date: null,
  height_cm: 170,
  gender: null,
  shoulders_length_cm: null,
  breast_length_cm: null,
  waist_length_cm: null,
  hips_length_cm: null,
  leg_length_cm: null,
};

function loadGuestMeasurements(): Partial<ProfileResponse> {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ProfileResponse>) : {};
  } catch {
    return {};
  }
}

function saveGuestMeasurements(data: ProfileUpdateData) {
  try {
    const current = loadGuestMeasurements();
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify({ ...current, ...data })
    );
  } catch {
    // localStorage недоступен
    console.warn('localStorage unavailable');
  }
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = () => !!tokenStorage.getAccess();

  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn()) {
      const saved = loadGuestMeasurements();
      setProfile({ ...GUEST_PROFILE, ...saved });
      setLoading(false);
      return;
    }
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
    if (!isLoggedIn()) {
      saveGuestMeasurements(data);
      setProfile((prev) =>
        prev ? ({ ...prev, ...data } as ProfileResponse) : prev
      );
      return;
    }
    try {
      const updated = await userApi.updateProfile(data);
      setProfile(updated);
    } catch {
      setProfile((prev) =>
        prev ? ({ ...prev, ...data } as ProfileResponse) : prev
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