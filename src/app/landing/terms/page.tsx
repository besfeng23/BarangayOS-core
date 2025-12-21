

import LegalShell from '@/components/marketing/LegalShell';

export const metadata = {
  title: "Terms of Usage & License — BarangayOS",
  description: "This software is a Digital Governance Terminal intended solely for official barangay transactions.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Usage & License">
        <section className="prose prose-sm md:prose-base prose-invert max-w-none">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/80 mb-4">For Official Government Use Only</p>

            <h3 className="text-foreground font-bold mt-6">1. Authorized Use Only</h3>
            <p className="text-muted-foreground text-base">
                This software is a <strong>Digital Governance Terminal</strong> intended solely for official barangay transactions. 
                Personal use, gaming, or installation of unauthorized third-party apps is strictly prohibited and may void the support warranty.
            </p>

            <h3 className="text-foreground font-bold mt-6">2. Falsification Warning</h3>
            <p className="text-destructive-foreground bg-destructive/20 border-l-4 border-destructive p-4 rounded-md">
                <strong>WARNING:</strong> The creation of false certificates, clearances, or blotter entries using this system constitutes <strong>Falsification of Public Documents</strong> 
                (Revised Penal Code Articles 171 & 172). BarangayOS maintains immutable audit logs that can be used as evidence in administrative or criminal proceedings against erring officials.
            </p>

            <h3 className="text-foreground font-bold mt-6">3. Trial & Activation</h3>
            <p className="text-muted-foreground text-base">
                Trial units are valid for 7 days. Upon expiration, the system will enter "Read-Only Mode." 
                <strong>No data will be deleted.</strong> To restore full functionality (Creation/Printing), the unit must be activated by an authorized distributor.
            </p>
        </section>
    </LegalShell>
  );
}
