
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const StepIndicator = ({ current, total }: { current: number, total: number }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < current ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
        ))}
    </div>
);

type FormState = {
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
    sex: "Male" | "Female" | "Other" | "";
    birthdate: string;
    civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "Unknown" | "";
    purok: string;
    addressLine1: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function ResidentCreatePage() {
  const router = useRouter();
  const { createResident, checkDuplicateLocal } = useResidentsData();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    sex: "",
    birthdate: "",
    civilStatus: "",
    purok: "",
    addressLine1: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newResidentId, setNewResidentId] = useState<string | null>(null);

  const age = useMemo(() => (form.birthdate ? calcAge(form.birthdate) : null), [form.birthdate]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    if (currentStep === 1) {
        if (!form.lastName) newErrors.lastName = "Last name is required.";
        if (!form.firstName) newErrors.firstName = "First name is required.";
    }
    if (currentStep === 2) {
        if (!form.birthdate) newErrors.birthdate = "Birthdate is required.";
        if (!form.sex) newErrors.sex = "Please select a sex.";
        if (!form.civilStatus) newErrors.civilStatus = "Please select a civil status.";
    }
    if (currentStep === 3) {
        if (!form.purok) newErrors.purok = "Purok is required.";
        if (!form.addressLine1) newErrors.addressLine1 = "Address is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  async function handleSave() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all required fields on all steps.",
        });
        return;
    }

    setSaving(true);
    try {
      const match = await checkDuplicateLocal(form.lastName, form.firstName, form.birthdate);
      if (match) {
        toast({
            variant: "destructive",
            title: "Possible Duplicate Found",
            description: `A record for ${match.firstName} ${match.lastName} with the same birthdate already exists.`,
        });
        setSaving(false);
        return;
      }

      const rec = await createResident({ ...form, status: "ACTIVE" });
      setNewResidentId(rec.id);
      setShowSuccessModal(true);
      
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Your draft was kept. Please try again.",
        });
    } finally {
      setSaving(false);
    }
  }
  
  const handleCloseSuccessModal = (viewProfile: boolean) => {
      setShowSuccessModal(false);
      if (viewProfile && newResidentId) {
          router.push(`/residents/${newResidentId}?toast=${encodeURIComponent("Resident saved locally — queued for sync")}`);
      } else {
          // Reset form for another entry
          setForm({
            lastName: "", firstName: "", middleName: "", suffix: "",
            sex: "", birthdate: "", civilStatus: "", purok: "", addressLine1: ""
          });
          setStep(1);
          setNewResidentId(null);
      }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1Name form={form} setForm={setForm} errors={errors} />;
      case 2:
        return <Step2Personal form={form} setForm={setForm} errors={errors} age={age} />;
      case 3:
        return <Step3Address form={form} setForm={setForm} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
        <header className="p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">New Resident</h1>
                <p className="text-slate-400">Step {step} of 3</p>
            </div>
        </header>

        <div className="p-4 flex-grow overflow-y-auto">
          <div className="mb-4">
            <StepIndicator current={step} total={3} />
          </div>
          {renderStepContent()}
        </div>

        <footer className="p-4 border-t border-slate-700 bg-slate-900 sticky bottom-0">
            <div className="flex justify-between">
                <Button variant="outline" className="h-12 text-lg" onClick={handleBack} disabled={step === 1 || saving}>
                    Back
                </Button>
                {step < 3 ? (
                    <Button className="h-12 text-lg" onClick={handleNext}>Next</Button>
                ) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : 'Save Resident'}
                    </Button>
                )}
            </div>
        </footer>
        
        <AlertDialog open={showSuccessModal} onOpenChange={(open) => !open && handleCloseSuccessModal(false)}>
            <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>✅ Resident Saved</AlertDialogTitle>
                    <AlertDialogDescription>
                        Saved locally on this device. Queued for sync.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="outline" onClick={() => handleCloseSuccessModal(false)}>Add Another</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button onClick={() => handleCloseSuccessModal(true)}>View Profile</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

const Field = ({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) => (
  <div className="space-y-2">
    <label className="text-lg font-medium">{label}</label>
    {children}
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

const Step1Name = ({ form, setForm, errors }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors }) => (
    <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
            <CardTitle>Step 1: Name</CardTitle>
            <CardDescription>Enter the resident's legal name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Field label="Last Name *" error={errors.lastName}>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.lastName && 'border-red-500'}`} />
            </Field>
            <Field label="First Name *" error={errors.firstName}>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.firstName && 'border-red-500'}`} />
            </Field>
            <Field label="Middle Name">
                <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="h-12 text-lg bg-slate-900 border-slate-600" />
            </Field>
            <Field label="Suffix (e.g. Jr., Sr., III)">
                <Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} className="h-12 text-lg bg-slate-900 border-slate-600" />
            </Field>
        </CardContent>
    </Card>
);

const Step2Personal = ({ form, setForm, errors, age }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors, age: number | null }) => (
     <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
            <CardTitle>Step 2: Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <Field label="Birthdate *" error={errors.birthdate}>
                    <Input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.birthdate && 'border-red-500'}`} />
                </Field>
                <Field label="Age">
                    <div className="h-12 text-lg flex items-center px-3 rounded-md bg-slate-800/50 border border-slate-700">{age !== null ? `${age} years old` : '-'}</div>
                </Field>
            </div>
            <Field label="Sex *" error={errors.sex}>
                <Select onValueChange={(value: FormState['sex']) => setForm({ ...form, sex: value })} value={form.sex}>
                    <SelectTrigger className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.sex && 'border-red-500'}`}>
                        <SelectValue placeholder="Select sex..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
             <Field label="Civil Status *" error={errors.civilStatus}>
                 <Select onValueChange={(value: FormState['civilStatus']) => setForm({ ...form, civilStatus: value })} value={form.civilStatus}>
                    <SelectTrigger className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.civilStatus && 'border-red-500'}`}>
                        <SelectValue placeholder="Select civil status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Separated">Separated</SelectItem>
                        <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
        </CardContent>
    </Card>
);

const Step3Address = ({ form, setForm, errors }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors }) => (
     <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
            <CardTitle>Step 3: Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <Field label="Purok / Zone *" error={errors.purok}>
                <Input value={form.purok} onChange={(e) => setForm({ ...form, purok: e.target.value })} placeholder="e.g. Purok 3" className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.purok && 'border-red-500'}`} />
            </Field>
            <Field label="Address Line *" error={errors.addressLine1}>
                <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="e.g. 123 Rizal St., Brgy. Dau" className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.addressLine1 && 'border-red-500'}`} />
            </Field>
        </CardContent>
    </Card>
);
