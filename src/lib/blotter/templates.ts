import { BlotterLocal } from "@/lib/bosDb";
import { getSettingsSnapshot } from "@/lib/bos/print/getSettingsSnapshot";


function esc(s: string) {
  return (s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export async function buildBlotterPrintHTML(b: BlotterLocal) {
  const settings = await getSettingsSnapshot();
  const incidentDate = new Date(b.incidentDateISO).toLocaleDateString();
  const printedAt = new Date().toLocaleString();

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Blotter Record</title>
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
    <div class="sub">Blotter Record (Incident Log)</div>
  </div>

  <div class="row"><span class="label">Record ID:</span> ${esc(b.id)}</div>
  <div class="row"><span class="label">Status:</span> ${esc(b.status)}</div>
  <div class="row"><span class="label">Incident Date:</span> ${esc(incidentDate)}</div>
  <div class="row"><span class="label">Location:</span> ${esc(b.locationText)}</div>

  <div class="row"><span class="label">Complainant:</span> ${esc(b.complainantName)} ${b.complainantContact ? `(${esc(b.complainantContact)})` : ""}</div>
  <div class="row"><span class="label">Respondent:</span> ${esc(b.respondentName)} ${b.respondentContact ? `(${esc(b.respondentContact)})` : ""}</div>

  <div class="box">
    <div class="label">Narrative</div>
    <div>${esc(b.narrative)}</div>

    ${b.actionsTaken ? `<div style="margin-top:12px;"><span class="label">Actions Taken:</span><br/>${esc(b.actionsTaken)}</div>` : ""}
    ${b.settlement ? `<div style="margin-top:12px;"><span class="label">Settlement:</span><br/>${esc(b.settlement)}</div>` : ""}
    ${b.notes ? `<div style="margin-top:12px;"><span class="label">Notes:</span><br/>${esc(b.notes)}</div>` : ""}
  </div>

  <div class="sig">
    <div class="line">Complainant Signature</div>
    <div class="line">${esc(settings.punongBarangay)}<br/>Punong Barangay</div>
  </div>

  <div class="meta">Printed: ${esc(printedAt)} • System: BarangayOS</div>
</body>
</html>`;
}
