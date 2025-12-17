import React from "react";

export function SummonsTemplate({ data }: { data: any }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.4, color: 'black' }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>BARANGAY SUMMONS</div>
        <div style={{ fontSize: 12 }}>Case No: <b>{data.caseNumber}</b></div>
        <div style={{ fontSize: 12 }}>Date Issued: {data.dateIssued}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div><b>Complainant(s):</b> {data.complainantsText}</div>
        <div><b>Respondent(s):</b> {data.respondentsText}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div><b>Incident Date:</b> {data.incidentDate}</div>
        <div><b>Hearing Date:</b> {data.hearingDate || "To be scheduled"}</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700 }}>NOTICE</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>
          You are hereby summoned to appear before the Lupon Tagapamayapa for mediation/conciliation.
          Failure to appear may result in appropriate action under barangay procedures.
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: "1px solid #000", marginTop: 44 }} />
            <div style={{ fontSize: 12 }}><b>Lupon Secretary</b></div>
          </div>
          <div style={{ flex: 1 }}>
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
