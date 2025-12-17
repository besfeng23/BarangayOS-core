import React from "react";

export function BlotterSummonsTemplate({
  controlNo,
  caseNumber,
  complainants,
  respondents,
  hearingDate,
  incidentDate,
  narrative,
  signer,
}: any) {
  return (
    <div className="w-full">
      <div className="text-center">
        <div className="text-xs">Republic of the Philippines</div>
        <div className="text-xs">Province of Pampanga</div>
        <div className="text-xs">Municipality/City: __________</div>
        <div className="text-xs">Barangay: __________</div>

        <div className="mt-4 text-lg font-extrabold">SUMMONS</div>

        <div className="mt-2 text-xs">
          <span className="font-bold">Control No:</span> {controlNo}
          <span className="mx-3">•</span>
          <span className="font-bold">Case No:</span> {caseNumber}
        </div>
      </div>

      <div className="mt-8 text-sm leading-6">
        <p className="font-bold">TO:</p>
        <p className="mt-2">
          <span className="font-bold">{respondents}</span>
        </p>

        <p className="mt-6">
          You are hereby required to appear before the Barangay Lupon on the date indicated below for the hearing of a complaint
          filed by <span className="font-bold">{complainants}</span>.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <p><span className="font-bold">Incident Date:</span> {incidentDate}</p>
          <p><span className="font-bold">Hearing Date:</span> {hearingDate || "To be scheduled"}</p>
        </div>

        <p className="mt-6 font-bold">NARRATIVE:</p>
        <div className="mt-2 border border-black p-3 whitespace-pre-wrap text-sm">
          {narrative}
        </div>

        <p className="mt-8">
          Failure to appear may result in appropriate action pursuant to Katarungang Pambarangay procedures.
        </p>
      </div>

      <div className="mt-12 flex justify-end">
        <div className="text-center">
          <div className="h-10" />
          <div className="font-bold uppercase">{signer}</div>
          <div className="text-xs">Punong Barangay / Authorized Signatory</div>
        </div>
      </div>

      <div className="page-break" />
    </div>
  );
}
