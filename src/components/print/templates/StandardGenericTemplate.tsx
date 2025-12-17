import React from "react";
import { getCertTitle } from "@/lib/certUtils";

export function StandardGenericTemplate({
  type,
  controlNo,
  dateIssued,
  residentName,
  residentAddress,
  signer,
  bodyText,
}: {
  type: "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";
  controlNo: string;
  dateIssued: string;
  residentName: string;
  residentAddress: string;
  signer: string;
  bodyText?: string;
}) {
  return (
    <div className="w-full">
      <div className="text-center">
        <div className="text-xs">Republic of the Philippines</div>
        <div className="text-xs">Province of Pampanga</div>
        <div className="text-xs">Municipality/City: __________</div>
        <div className="text-xs">Barangay: __________</div>

        <div className="mt-4 text-lg font-extrabold">{getCertTitle(type)}</div>

        <div className="mt-2 text-xs">
          <span className="font-bold">Control No:</span> {controlNo}
          <span className="mx-3">•</span>
          <span className="font-bold">Date Issued:</span> {dateIssued}
        </div>
      </div>

      <div className="mt-8 text-sm leading-6">
        <p className="font-bold">TO WHOM IT MAY CONCERN:</p>

        <p className="mt-4">
          This is to certify that <span className="font-bold">{residentName}</span>, residing at{" "}
          <span className="font-bold">{residentAddress}</span>, is known to this office.
        </p>

        <p className="mt-4">
          {bodyText ||
            "This certification is issued upon request of the above-named person for whatever legal purpose it may serve."}
        </p>

        <p className="mt-6">
          Issued this <span className="font-bold">{dateIssued}</span>.
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
