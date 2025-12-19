"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";
import { useResidentQuickSearch } from "@/hooks/useResidentQuickSearch";
import NewCaseModal from "@/components/blotter/NewCaseModal";
import BlotterPage from "./BlotterPage";

export default function BlotterCreatePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <>
      <BlotterPage />
      <NewCaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
