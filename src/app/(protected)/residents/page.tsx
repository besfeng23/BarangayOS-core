
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { residentConverter } from '@/lib/firebase/schema';
import { verifySessionCookie } from '@/lib/firebase/auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

async function getResidents(barangayId: string) {
    // Moved Admin DB init inside the function to avoid build-time execution
    const adminDb = getAdminDb();
    const residentsRef = collection(adminDb, 'residents').withConverter(residentConverter);
    const q = query(residentsRef, where("barangayId", "==", barangayId));
    
    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching residents:", error);
        // Throwing the error will be caught by the error boundary
        throw new Error("Failed to fetch resident data from the server.");
    }
}

export default async function ResidentsPage() {
    const decodedClaims = await verifySessionCookie();
    
    if (!decodedClaims) {
        // This check is redundant due to the layout, but good for safety.
        return redirect('/login');
    }

    const residents = await getResidents(decodedClaims.barangayId || 'TEST-BARANGAY-1');

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
                      {r.addressSnapshot.purok} • ID: {r.id.slice(0, 8)}...
                    </div>
                  </div>
                ))
              )}
            </div>
      </div>
    )
}
