"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

export default function NarrativeStep() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Incident Narrative</CardTitle>
          <CardDescription>
            Provide a detailed account of the incident. Be as specific as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="narrative">Details of Incident</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-bold mb-2">5Ws and 1H Guide</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                        <li><strong>Who:</strong> Who are the people involved?</li>
                        <li><strong>What:</strong> What happened? Describe the event.</li>
                        <li><strong>Where:</strong> Where did the incident take place?</li>
                        <li><strong>When:</strong> When did it happen (date and time)?</li>
                        <li><strong>Why:</strong> Why did the incident occur?</li>
                        <li><strong>How:</strong> How did the incident unfold?</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea 
                id="narrative" 
                rows={10}
                placeholder="Start writing the incident report here..." 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
