import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { residentConverter } from '@/lib/firebase/schema';
import { verifySessionCookie } from '@/lib/firebase/auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import {
  LolaCard,
  LolaEmptyState,
  LolaHeader,
  LolaPage,
  LolaPrimaryButton,
  LolaRowLink,
  LolaSection,
} from '@/components/lola';

async function getResidents(barangayId: string) {
    const adminDb = getAdminDb();
    const residentsRef = collection(adminDb, 'residents').withConverter(residentConverter);
    const q = query(residentsRef, where("barangayId", "==", barangayId));
    
    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching residents:", error);
        throw new Error("Failed to fetch resident data from the server.");
    }
}

export default async function ResidentsPage() {
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

    if (bypassAuth) {
        const demoResidents = [
            {
                id: 'demo-1',
                displayName: 'Demo Resident',
                addressSnapshot: { purok: 'Sample' },
            },
        ];
        return (
            <LolaPage>
                <LolaHeader
                    title="Resident Records"
                    subtitle="Single column directory with easy chevrons for Lola."
                    action={
                      <Link href="/residents/new">
                        <LolaPrimaryButton className="w-full sm:w-auto">+ Add Resident</LolaPrimaryButton>
                      </Link>
                    }
                />

                <LolaSection>
                  <LolaCard className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-base text-slate-700">
                      <span className="font-semibold text-slate-900">All residents</span>
                      <span className="text-sm font-semibold text-blue-700">{demoResidents.length} total</span>
                    </div>
                    <div className="space-y-3">
                      {demoResidents.map((r) => (
                        <LolaRowLink
                          key={r.id}
                          title={r.displayName}
                          description={`Purok ${r.addressSnapshot.purok}`}
                          href={`/residents/${r.id}`}
                          meta="View"
                        />
                      ))}
                    </div>
                  </LolaCard>
                </LolaSection>
          </LolaPage>
        );
    }

    const decodedClaims = await verifySessionCookie();

    if (!decodedClaims?.uid || !decodedClaims?.barangayId) {
        return redirect('/login');
    }

    const residents = await getResidents(decodedClaims.barangayId);

    return (
        <LolaPage>
            <LolaHeader
                title="Resident Records"
                    subtitle="Single column directory with easy chevrons for Lola."
                    action={
                  <Link href="/residents/new">
                    <LolaPrimaryButton className="w-full sm:w-auto">+ Add Resident</LolaPrimaryButton>
                  </Link>
                }
            />

            <LolaSection>
              <LolaCard className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-base text-slate-700">
                  <span className="font-semibold text-slate-900">All residents</span>
                  <span className="text-sm font-semibold text-blue-700">{residents.length} total</span>
                </div>
                {residents.length === 0 ? (
                  <LolaEmptyState
                    title="No residents found"
                    message="Add your first resident to start issuing certificates and blotter records."
                    action={
                      <Link href="/residents/new">
                        <LolaPrimaryButton>Start with a new resident</LolaPrimaryButton>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {residents.map((r) => (
                      <LolaRowLink
                        key={r.id}
                        title={r.displayName}
                        description={`Purok ${r.addressSnapshot.purok}`}
                        href={`/residents/${r.id}`}
                        meta="View"
                      />
                    ))}
                  </div>
                )}
              </LolaCard>
            </LolaSection>
      </LolaPage>
    );
}
