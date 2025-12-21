'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIAssistButtonProps {
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
}

export default function AIAssistButton({ onClick, disabled, tooltip = "Draft with AI" }: AIAssistButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span tabIndex={0}>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClick}
                            disabled={disabled}
                            className="gap-2"
                        >
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span>AI Assist</span>
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
