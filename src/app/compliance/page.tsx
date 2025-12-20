

import LegalShell from '@/components/marketing/LegalShell';

export const metadata = {
  title: "Statement of Compliance — BarangayOS",
  description: "BarangayOS is engineered to assist Barangays in strictly adhering to mandatory national laws and DILG Memorandum Circulars.",
};

export default function CompliancePage() {
  return (
    <LegalShell title="Statement of Compliance">
        <div className="prose prose-invert max-w-none">
            <p className="text-gray-400">
                BarangayOS is engineered to assist Barangays in strictly adhering to the following Republic Acts and DILG Memorandum Circulars. 
                Deployment of this terminal automatically standardizes these mandatory workflows.
            </p>

            <div className="my-8 grid gap-6">
                <div className="bg-gray-900 border border-emerald-500/30 p-6 rounded-xl">
                    <h3 className="text-emerald-400 font-bold text-lg">R.A. 11032 — Ease of Doing Business Act</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        <strong>Mandate:</strong> Government services must be delivered efficiently with zero contact policy where possible.<br />
                        <strong>Solution:</strong> The <em>Certificates Module</em> generates clearances in under 60 seconds, reducing queue times and eliminating "red tape" delays.
                    </p>
                </div>

                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg">DILG MC No. 2008-144 — RBIA Maintenance</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        <strong>Mandate:</strong> Establishment and maintenance of the Registry of Barangay Inhabitants and Migrants (RBIA).<br />
                        <strong>Solution:</strong> The <em>Resident Index</em> creates a digital, searchable RBIA that categorizes residents by household, age, and residency status automatically.
                    </p>
                </div>

                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-white font-bold text-lg">P.D. 1508 — Katarungang Pambarangay Law</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        <strong>Mandate:</strong> Proper logging, conciliation, and arbitration of community disputes.<br />
                        <strong>Solution:</strong> The <em>Digital Blotter</em> ensures all cases are logged with timestamps, narratives, and disposition status (Settled, Certified for Action, Dismissed) for accurate legal reporting.
                    </p>
                </div>
            </div>
        </div>
    </LegalShell>
  );
}
