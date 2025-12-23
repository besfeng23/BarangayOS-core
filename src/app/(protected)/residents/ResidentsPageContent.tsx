import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { verifySessionCookie } from '@/lib/firebase/auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

async function getResidents(barangayId: string) {
    const adminDb = getAdminDb();

    try {
        const snapshot = await adminDb
            .collection('residents')
            .where('barangayId', '==', barangayId)
            .get();

        return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
        console.error("Error fetching residents:", error);
        throw new Error("Failed to fetch resident data from the server.");
    }
}

export default async function ResidentsPageContent() {
    const decodedClaims = await verifySessionCookie();

    if (!decodedClaims?.uid) {
        console.log('[residents] redirecting: missing uid or session cookie');
        return redirect('/login');
    }

    // Resolve barangayId from claims or Firestore profile documents
    const adminDb = getAdminDb();
    let resolvedBarangayId = (decodedClaims as { barangayId?: string })?.barangayId as string | undefined;

    if (!resolvedBarangayId) {
        const userDocRef = adminDb.doc(`users/${decodedClaims.uid}`);
        const userProfileRef = adminDb.doc(`userProfiles/${decodedClaims.uid}`);

        const [userDoc, userProfileDoc] = await Promise.all([userDocRef.get(), userProfileRef.get()]);
        resolvedBarangayId = (userDoc.data() as { barangayId?: string } | undefined)?.barangayId
          || (userProfileDoc.data() as { barangayId?: string } | undefined)?.barangayId;
    }

    if (!resolvedBarangayId) {
        console.log('[residents] barangay not configured for uid', decodedClaims.uid);
        return (
            <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
                <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                    <h1 className="text-xl font-semibold">Barangay not configured</h1>
                    <p className="text-sm text-muted-foreground">
                        This account does not have an assigned barangay. Please try again or contact an admin.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link href="/apps" passHref>
                            <Button variant="outline">Back</Button>
                        </Link>
                        <Link href="/residents" passHref>
                            <Button>Try again</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    console.log('[residents] resolved barangayId', resolvedBarangayId);
    const residents = await getResidents(resolvedBarangayId);

    return (
        <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Resident Records</h1>
                    <p className="text-muted-foreground text-sm mt-1">Directory of all constituents.</p>
                </div>
                <Link href="/residents/new" passHref>
                    <Button>+ Add New Resident</Button>
                </Link>
            </div>
            
            <div className="rounded-xl border bg-card p-4">
              <div className="mt-3 text-xs text-muted-foreground">
                {residents.length} result(s)
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {residents.length === 0 ? (
                 <div className="text-center p-12 border-2 border-dashed rounded-xl">
                    <p className="font-semibold text-lg">No Residents Found</p>
                    <p className="mt-4 text-muted-foreground">Click "+ Add New Resident" to get started.</p>
                </div>
              ) : (
                residents.map((r) => (
                  <div
                    key={r.id}
                    className="w-full rounded-xl border bg-card p-4 text-left"
                  >
                    <div className="font-semibold">{r.displayName}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {(r.addressSnapshot?.purok ?? 'N/A')} • ID: {r.id ? `${r.id.slice(0, 8)}...` : 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
      </div>
    )
}
