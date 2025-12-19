import { CertificateIssuanceLocal } from "@/lib/bosDb";
import { getSettingsSnapshot } from "@/lib/bos/print/getSettingsSnapshot";

function esc(s: string) {
  return (s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export async function buildCertificateHTML(issuance: CertificateIssuanceLocal) {
  const settings = await getSettingsSnapshot();
  const title = issuance.certType;
  const purposeLine = issuance.purpose?.trim() ? `<div style="margin-top:12px;"><b>Purpose:</b> ${esc(issuance.purpose)}</div>` : "";
  const issuedAt = new Date(issuance.issuedAtISO).toLocaleString();

  // Print CSS (A4/Letter safe; keep simple)
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  @page { size: auto; margin: 14mm; }
  body { font-family: Arial, sans-serif; color: #111; }
  .header { text-align: center; margin-bottom: 18px; }
  .h1 { font-size: 18px; font-weight: 700; letter-spacing: .2px; }
  .sub { font-size: 12px; margin-top: 4px; }
  .box { margin-top: 16px; font-size: 13px; line-height: 1.5; }
  .sig { margin-top: 44px; display: flex; justify-content: space-between; gap: 24px; }
  .line { margin-top: 38px; border-top: 1px solid #333; width: 220px; padding-top: 6px; font-size: 12px; }
  .meta { margin-top: 18px; font-size: 11px; color: #444; }
</style>
</head>
<body>
  <div class="header">
    <div class="h1">${esc(settings.barangayName)}, ${esc(settings.barangayAddress)}</div>
    <div class="sub">${esc(title)}</div>
  </div>

  <div class="box">
    This is to certify that <b>${esc(issuance.residentName)}</b> is a resident of this barangay.
    ${purposeLine}
    <div style="margin-top:14px;">
      Issued this <b>${esc(issuedAt)}</b>.
    </div>
  </div>

  <div class="sig">
    <div class="line">Applicant Signature</div>
    <div class="line">${esc(settings.punongBarangay)}<br/>Punong Barangay</div>
  </div>

  <div class="meta">
    Control No: <b>${esc(issuance.controlNo)}</b> • Resident ID: ${esc(issuance.residentId)}
  </div>
</body>
</html>`;
}
