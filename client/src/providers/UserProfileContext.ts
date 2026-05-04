import { createContext } from 'react';
import type { ProfileResponse, ProfileUpdateData } from '../services/api';

export interface UserProfileContextType {
  profile: ProfileResponse | null;
  loading: boolean;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  refetch: () => Promise<void>;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  updateProfile: async () => {},
  refetch: async () => {},
});