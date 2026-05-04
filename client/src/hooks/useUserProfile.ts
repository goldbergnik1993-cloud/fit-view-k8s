import { useContext } from 'react';
import { UserProfileContext } from '../providers/UserProfileContext';

export function useUserProfile() {
  return useContext(UserProfileContext);
}