
import { cookies } from 'next/headers';
import { getAdminAuth } from './admin';

export async function verifySessionCookie() {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return null;
  }
  
  const adminAuth = getAdminAuth();

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
