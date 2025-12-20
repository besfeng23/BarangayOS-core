'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AIAssistButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function AIAssistButton({ onClick, disabled }: AIAssistButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className="gap-2"
        >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Draft with AI</span>
        </Button>
    )
}
