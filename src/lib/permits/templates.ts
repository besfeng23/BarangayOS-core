

import { PermitIssuanceLocal } from "@/lib/bosDb";
import { getSettingsSnapshot, BarangaySettingsSnapshot } from "@/lib/bos/print/getSettingsSnapshot";


function esc(s: string) {
  return (s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export function buildBusinessPermitHTML(p: PermitIssuanceLocal, settings: BarangaySettingsSnapshot) {
  const issuedAt = new Date(p.issuedAtISO).toLocaleString();
  const fee = isFinite(p.feeAmount) ? p.feeAmount.toFixed(2) : "0.00";

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Business Permit</title>
<style>
  @page { margin: 14mm; }
  body { font-family: Arial, sans-serif; color:#111; }
  .header { text-align:center; margin-bottom:18px; }
  .h1 { font-size:16px; font-weight:700; }
  .sub { font-size:12px; margin-top:4px; }
  .row { margin-top:10px; font-size:12px; }
  .label { color:#333; font-weight:700; }
  .box { margin-top:14px; border:1px solid #333; padding:10px; font-size:12px; line-height:1.5; }
  .sig { margin-top:34px; display:flex; justify-content:space-between; gap:24px; }
  .line { border-top:1px solid #333; width:220px; padding-top:6px; font-size:11px; }
  .meta { margin-top:14px; font-size:10px; color:#444; }
</style>
</head>
<body>
  <div class="header">
    <div class="h1">${esc(settings.barangayName)}, ${esc(settings.barangayAddress)}</div>
    <div class="sub">Business Permit / Renewal</div>
  </div>

  <div class="row"><span class="label">Control No:</span> ${esc(p.controlNo)}</div>
  <div class="row"><span class="label">Year:</span> ${esc(String(p.year))}</div>
  <div class="row"><span class="label">Issued:</span> ${esc(issuedAt)}</div>

  <div class="box">
    <div class="row"><span class="label">Business:</span> ${esc(p.businessName)}</div>
    <div class="row"><span class="label">Owner:</span> ${esc(p.ownerName)}</div>
    <div class="row"><span class="label">Fee:</span> ₱ ${esc(fee)}</div>
    ${p.orNo ? `<div class="row"><span class="label">O.R. No:</span> ${esc(p.orNo)}</div>` : ""}
    ${p.remarks ? `<div class="row"><span class="label">Remarks:</span> ${esc(p.remarks)}</div>` : ""}
  </div>

  <div class="sig">
    <div class="line">Owner/Applicant</div>
    <div class="line">${esc(settings.punongBarangay)}<br/>Punong Barangay</div>
  </div>

  <div class="meta">Business ID: ${esc(p.businessId)} • System: BarangayOS</div>
</body>
</html>`;
}
