import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlotterCase } from "@/app/blotter/page";

interface ActionCardProps {
  caseData: BlotterCase;
}

export default function ActionCard({ caseData }: ActionCardProps) {
  return (
    <Card className="bg-[#1e1e1e] border-red-600 border-2 min-w-[300px] h-[180px] flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-red-500 text-xl">Expiring Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">Case #{caseData.caseNumber}</p>
        <p className="text-lg text-gray-300">{caseData.incidentType}</p>
        <p className="text-sm text-gray-400">Deadline: {caseData.dates.deadlineDate.toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}
