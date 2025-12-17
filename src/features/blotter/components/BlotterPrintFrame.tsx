import React from "react";
import { SummonsTemplate } from "@/features/blotter/print/SummonsTemplate";
import { SettlementTemplate } from "@/features/blotter/print/SettlementTemplate";

export function BlotterPrintFrame({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div id="print-container" className="hidden print:block">
      {data.docType === "BLOTTER_SUMMONS" ? (
        <SummonsTemplate data={data} />
      ) : (
        <SettlementTemplate data={data} />
      )}
    </div>
  );
}
