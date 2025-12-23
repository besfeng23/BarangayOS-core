
import { cookies } from 'next/headers';
import { getAdminAuth } from './admin';

export async function verifySessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  const hasSessionCookie = Boolean(sessionCookie);
  console.log('[auth] verifySessionCookie', { hasSessionCookie });

  if (!sessionCookie) {
    return null;
  }
  
  const adminAuth = getAdminAuth();

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const hasUid = Boolean(decodedClaims?.uid);
    const decodedClaimKeys = Object.keys(decodedClaims || {});
    const hasBarangayClaim = Boolean((decodedClaims as { barangayId?: string })?.barangayId);
    console.log('[auth] verifySessionCookie decoded', { hasUid, decodedClaimKeys, hasBarangayClaim });
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
