"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WorkflowShellProps {
    title: string;
    steps: string[];
    currentStep: number;
    children: React.ReactNode;
}

export default function WorkflowShell({ title, steps, currentStep, children }: WorkflowShellProps) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>Step {currentStep} of {steps.length}: {steps[currentStep-1]}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {children}
      </CardContent>
    </div>
  );
}
