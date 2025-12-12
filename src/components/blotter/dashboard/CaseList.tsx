import { BlotterCase } from "@/app/blotter/page";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CaseListProps {
  cases: BlotterCase[];
  onViewCase: (caseData: BlotterCase) => void;
}

const statusColors: { [key in BlotterCase['status']]: string } = {
    MEDIATION: 'bg-yellow-500',
    CONCILIATION: 'bg-orange-500',
    SETTLED: 'bg-green-500',
    CFA_ISSUED: 'bg-red-500',
    ARCHIVED: 'bg-gray-500',
};


export default function CaseList({ cases, onViewCase }: CaseListProps) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-gray-700">
        <Table>
            <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-lg text-gray-300">Case #</TableHead>
                    <TableHead className="text-lg text-gray-300">Date</TableHead>
                    <TableHead className="text-lg text-gray-300">Type</TableHead>
                    <TableHead className="text-lg text-gray-300">Complainant</TableHead>
                    <TableHead className="text-lg text-gray-300">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cases.map((c) => (
                    <TableRow 
                        key={c.id} 
                        onClick={() => onViewCase(c)}
                        className={cn(
                            "cursor-pointer border-gray-800 h-[80px]",
                            c.isSensitive ? 'bg-pink-900/40 hover:bg-pink-900/60' : 'hover:bg-gray-800/60'
                        )}
                    >
                        <TableCell className="text-lg font-medium">{c.caseNumber}</TableCell>
                        <TableCell className="text-lg">{c.dates.reportedDate.toLocaleDateString()}</TableCell>
                        <TableCell className="text-lg">{c.incidentType}</TableCell>
                        <TableCell className="text-lg">
                            {c.isSensitive 
                                ? `${c.people.complainant.name.charAt(0)}**** ${c.people.complainant.name.split(' ').pop()?.charAt(0)}*****` 
                                : c.people.complainant.name}
                        </TableCell>
                        <TableCell>
                             <Badge className={cn("text-white text-sm", statusColors[c.status])}>
                                {c.status.replace('_', ' ')}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
