
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/firebase/auth-provider';

export const useAuth = () => {
  return useContext(AuthContext);
};
