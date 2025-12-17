import React from "react";

export function SettlementTemplate({ data }: { data: any }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: 'black' }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>AMICABLE SETTLEMENT</div>
        <div style={{ fontSize: 12 }}>Case No: <b>{data.caseNumber}</b></div>
        <div style={{ fontSize: 12 }}>Date: {data.dateIssued}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div><b>Parties:</b></div>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          <b>Complainant(s):</b> {data.complainantsText}<br />
          <b>Respondent(s):</b> {data.respondentsText}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 12 }}>
        <b>Settlement Terms:</b>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
          {data.terms || "The parties agree to settle amicably and comply with the agreed terms."}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12 }}>
        <b>Reference Narrative:</b>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
          {data.narrative}
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ borderTop: "1px solid #000", marginTop: 44 }} />
            <div style={{ fontSize: 12 }}><b>Complainant Signature</b></div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #000", marginTop: 44 }} />
            <div style={{ fontSize: 12 }}><b>Respondent Signature</b></div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #000", marginTop: 44 }} />
            <div style={{ fontSize: 12 }}><b>Lupon Mediator</b></div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #000", marginTop: 44 }} />
            <div style={{ fontSize: 12 }}><b>Punong Barangay</b></div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, marginTop: 18 }}>
        System Control: <b>{data.caseNumber}</b>
      </div>
    </div>
  );
}
