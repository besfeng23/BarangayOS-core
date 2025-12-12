import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <li key={step} className="flex items-start">
                <div className="flex-shrink-0">
                    <span className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2",
                        isCompleted ? "border-primary bg-primary text-primary-foreground" :
                        isActive ? "border-primary text-primary" :
                        "border-border group-hover:border-muted-foreground"
                    )}>
                        {isCompleted ? (
                            <Check className="h-6 w-6" />
                        ) : (
                            <span className="font-bold">{stepNumber}</span>
                        )}
                    </span>
                </div>
                <div className="ml-4 pt-2">
                    <p className={cn(
                        "text-sm font-medium",
                         isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                        {step}
                    </p>
                </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
