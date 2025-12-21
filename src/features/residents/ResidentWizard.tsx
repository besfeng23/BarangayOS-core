
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import WorkflowShell from "@/components/system/WorkflowShell";
import StickyActionBar from "@/components/system/StickyActionBar";
import ActionResultModal from "@/components/system/ActionResultModal";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

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
type FieldRefs = { [K in keyof FormState]: React.RefObject<HTMLDivElement> };

interface ResidentWizardProps {
    mode: 'create' | 'edit';
    initial?: any; // Dexie ResidentRecord
    onDone?: (residentId: string) => void;
}


export default function ResidentWizard({ mode, initial, onDone }: ResidentWizardProps) {
  const router = useRouter();
  const { createResident, checkDuplicateLocal } = useResidentsData();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    lastName: initial?.lastName || "",
    firstName: initial?.firstName || "",
    middleName: initial?.middleName || "",
    suffix: initial?.suffix || "",
    sex: initial?.sex || "",
    birthdate: initial?.birthdate || "",
    civilStatus: initial?.civilStatus || "",
    purok: initial?.purok || "",
    addressLine1: initial?.addressLine1 || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [saveResult, setSaveResult] = useState<{ok: boolean, message: string, statusLine: string} | null>(null);
  const [newResidentId, setNewResidentId] = useState<string | null>(initial?.id || null);
  const fieldRefs = useMemo<FieldRefs>(() => ({
    lastName: React.createRef<HTMLDivElement>(),
    firstName: React.createRef<HTMLDivElement>(),
    middleName: React.createRef<HTMLDivElement>(),
    suffix: React.createRef<HTMLDivElement>(),
    birthdate: React.createRef<HTMLDivElement>(),
    sex: React.createRef<HTMLDivElement>(),
    civilStatus: React.createRef<HTMLDivElement>(),
    purok: React.createRef<HTMLDivElement>(),
    addressLine1: React.createRef<HTMLDivElement>(),
  }), []);

  const age = useMemo(() => (form.birthdate ? calcAge(form.birthdate) : null), [form.birthdate]);

  const scrollToFirstError = (errs: FormErrors) => {
    const firstKey = Object.keys(errs)[0] as keyof FormState | undefined;
    if (firstKey && fieldRefs[firstKey]?.current) {
      fieldRefs[firstKey].current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = fieldRefs[firstKey].current?.querySelector("input, button, select") as HTMLElement | null;
      input?.focus();
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    if (currentStep === 1) {
        if (!form.lastName) newErrors.lastName = "Last name is required.";
        if (!form.firstName) newErrors.firstName = "First name is required.";
    }
    if (currentStep === 2) {
        if (!form.birthdate) newErrors.birthdate = "Birthdate is required.";
        if (!form.sex) newErrors.sex = "Please select an option.";
        if (!form.civilStatus) newErrors.civilStatus = "Please select an option.";
    }
    if (currentStep === 3) {
        if (!form.purok) newErrors.purok = "Purok is required.";
        if (!form.addressLine1) newErrors.addressLine1 = "Address is required.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
        setStep(prev => prev - 1);
    } else {
        router.back();
    }
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
      if (mode === 'create') {
        const match = await checkDuplicateLocal(form.lastName, form.firstName, form.birthdate);
        if (match) {
          throw new Error(`Possible Duplicate: A record for ${match.firstName} ${match.lastName} with the same birthdate already exists.`);
        }
      }

      const rec = await createResident({ ...form, status: "ACTIVE" }); // createResident handles both create and update
      
      await writeActivity({
        type: mode === 'create' ? "RESIDENT_CREATED" : "RESIDENT_UPDATED",
        entityType: "resident",
        entityId: rec.id,
        status: "ok",
        title: `Resident ${mode === 'create' ? 'Created' : 'Updated'}`,
        subtitle: `${(rec as any).fullName} • ${(rec as any).purok || 'No Purok'}`,
      } as any);

      setNewResidentId(rec.id);
      setSaveResult({ ok: true, message: "Resident Saved", statusLine: isOnline ? "Data has been synced to the cloud." : "Saved locally. Queued for sync." });
      if(onDone) onDone(rec.id);

    } catch (error: any) {
        setSaveResult({ ok: false, message: "Save Failed", statusLine: error.message || "Your draft was kept. Please try again." });
    } finally {
      setSaving(false);
      setShowResultModal(true);
    }
  }
  
  const handleModalClose = () => {
      setShowResultModal(false);
  }

  const handleAddAnother = () => {
      setShowResultModal(false);
      setForm({ lastName: "", firstName: "", middleName: "", suffix: "", sex: "", birthdate: "", civilStatus: "", purok: "", addressLine1: "" });
      setStep(1);
      setNewResidentId(null);
      router.push('/residents/new');
  }

  const handleViewProfile = () => {
      setShowResultModal(false);
      if(newResidentId) {
        router.push(`/residents/${newResidentId}`);
      }
  }


  const steps = ["Name", "Personal Details", "Address"];
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1Name form={form} setForm={setForm} errors={errors} refs={fieldRefs} />;
      case 2:
        return <Step2Personal form={form} setForm={setForm} errors={errors} age={age} refs={fieldRefs} />;
      case 3:
        return <Step3Address form={form} setForm={setForm} errors={errors} refs={fieldRefs} />;
      default:
        return null;
    }
  };

  return (
    <>
        <div className="flex flex-col h-full">
            <WorkflowShell title={mode === 'create' ? "New Resident Record" : "Edit Resident Record"} steps={steps} currentStep={step}>
                <div className="py-6">
                    {renderStepContent()}
                </div>
            </WorkflowShell>

            <StickyActionBar>
                <Button variant="outline" className="h-12 text-lg" onClick={handleBack} disabled={saving}>
                    {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                {step < 3 ? (
                    <Button className="h-12 text-lg" onClick={handleNext}>Next</Button>
                ) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : <><Save className="mr-2 h-5 w-5" /> Save Resident</>}
                    </Button>
                )}
            </StickyActionBar>
        </div>

        {saveResult && (
            <ActionResultModal
                isOpen={showResultModal}
                onClose={handleModalClose}
                result={saveResult}
                onRetry={handleSave}
                primaryActionText={mode === 'create' ? "Add Another" : "Close"}
                onPrimaryAction={mode === 'create' ? handleAddAnother : handleViewProfile}
                secondaryActionText="View Profile"
                onSecondaryAction={handleViewProfile}
            />
        )}
    </>
  );
}

const Field = React.forwardRef<HTMLDivElement, { label: string; children: React.ReactNode; error?: string }>(
  ({ label, children, error }, ref) => (
    <div className="space-y-2" ref={ref}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  )
);
Field.displayName = "Field";

const Step1Name = ({ form, setForm, errors, refs }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors, refs: FieldRefs }) => (
    <Card className="bg-zinc-900/40 border-zinc-800 rounded-2xl">
        <CardContent className="space-y-6 pt-6">
            <Field label="Last Name *" error={errors.lastName} ref={refs.lastName}>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.lastName && 'border-red-500'}`} />
            </Field>
            <Field label="First Name *" error={errors.firstName} ref={refs.firstName}>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.firstName && 'border-red-500'}`} />
            </Field>
            <Field label="Middle Name" ref={refs.middleName}>
                <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="h-12 text-lg bg-zinc-950 border-zinc-700" />
            </Field>
            <Field label="Suffix (e.g. Jr., Sr., III)" ref={refs.suffix}>
                <Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} className="h-12 text-lg bg-zinc-950 border-zinc-700" />
            </Field>
        </CardContent>
    </Card>
);

const Step2Personal = ({ form, setForm, errors, age, refs }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors, age: number | null, refs: FieldRefs }) => (
     <Card className="bg-zinc-900/40 border-zinc-800 rounded-2xl">
        <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
                <Field label="Birthdate *" error={errors.birthdate} ref={refs.birthdate}>
                    <Input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.birthdate && 'border-red-500'}`} />
                </Field>
                <Field label="Age">
                    <div className="h-12 text-lg flex items-center px-3 rounded-md bg-zinc-800/50 border border-zinc-700">{age !== null ? `${age} years old` : '-'}</div>
                </Field>
            </div>
            <Field label="Sex *" error={errors.sex} ref={refs.sex}>
                <Select onValueChange={(value: FormState['sex']) => setForm({ ...form, sex: value })} value={form.sex}>
                    <SelectTrigger className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.sex && 'border-red-500'}`}>
                        <SelectValue placeholder="Please select an option..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
             <Field label="Civil Status *" error={errors.civilStatus} ref={refs.civilStatus}>
                 <Select onValueChange={(value: FormState['civilStatus']) => setForm({ ...form, civilStatus: value })} value={form.civilStatus}>
                    <SelectTrigger className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.civilStatus && 'border-red-500'}`}>
                        <SelectValue placeholder="Please select an option..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 text-white border-zinc-700">
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

const Step3Address = ({ form, setForm, errors, refs }: { form: FormState, setForm: (f: FormState) => void, errors: FormErrors, refs: FieldRefs }) => (
     <Card className="bg-zinc-900/40 border-zinc-800 rounded-2xl">
        <CardContent className="space-y-6 pt-6">
            <Field label="Purok / Zone *" error={errors.purok} ref={refs.purok}>
                <Input value={form.purok} onChange={(e) => setForm({ ...form, purok: e.target.value })} placeholder="e.g. Purok 3" className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.purok && 'border-red-500'}`} />
            </Field>
            <Field label="Address Line *" error={errors.addressLine1} ref={refs.addressLine1}>
                <Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} placeholder="e.g. 123 Rizal St., Brgy. Dau" className={`h-12 text-lg bg-zinc-950 border-zinc-700 ${errors.addressLine1 && 'border-red-500'}`} />
            </Field>
        </CardContent>
    </Card>
);
