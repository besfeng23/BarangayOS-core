
import LegalShell from '@/components/marketing/LegalShell';

export const metadata = {
  title: "Data Privacy & Sovereignty Policy — BarangayOS",
  description: "BarangayOS acknowledges that all data encoded into this terminal is the sole property of the Local Government Unit (Barangay).",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Data Privacy & Sovereignty Policy">
        <section className="prose prose-invert max-w-none">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Effective Date: January 1, 2024</p>
            
            <div className="bg-gray-900 border border-white/10 p-6 rounded-xl mb-6">
                The Barangay/LGU is the Personal Information Controller (PIC). BarangayOS is the Personal Information Processor (PIP) acting only under the LGU’s instructions.
            </div>

            <h3 className="text-white font-bold mt-6">1. Data Ownership (LGU Sovereignty)</h3>
            <p className="text-gray-400 text-sm">
                BarangayOS acknowledges that all data encoded into this terminal is the <strong>sole property of the Local Government Unit (Barangay)</strong>. 
                BarangayOS acts strictly as a Service Provider/Data Processor. We do not sell, aggregate, or mine constituent data for advertising.
            </p>

            <h3 className="text-white font-bold mt-6">2. Compliance with R.A. 10173</h3>
            <div className="text-gray-400 text-sm">
                <p>
                    This system is designed to comply with the <strong>Data Privacy Act of 2012</strong>.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Access Control:</strong> Only authorized staff (Secretary, Captain) with valid credentials may access the resident index.</li>
                    <li><strong>Audit Logs:</strong> Every view, edit, and print action is logged permanently to deter unauthorized snooping.</li>
                    <li><strong>Data Portability:</strong> The LGU retains the right to export their full database to CSV/Excel at any time without restriction.</li>
                </ul>
            </div>

            <h3 className="text-white font-bold mt-6">3. Offline Storage</h3>
            <p className="text-gray-400 text-sm">
                During offline operation, data is encrypted locally on the terminal's hard drive. Syncing to the cloud occurs over an encrypted (TLS 1.2+) connection only when internet is available.
            </p>
        </section>
    </LegalShell>
  );
}
