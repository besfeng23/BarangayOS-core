'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addResident } from '../_actions/addResident';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { LolaCard, LolaHeader, LolaInput, LolaPage, LolaPrimaryButton } from '@/components/lola';

const formSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    purok: z.string().min(1, "Purok is required"),
});

export default function NewResidentPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            purok: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await addResident(values);
        if (result.success) {
            toast({
                title: "Resident Added",
                description: "The new resident has been saved to Firestore.",
            });
            router.push('/residents');
        } else {
            toast({
                variant: 'destructive',
                title: "Error",
                description: result.error,
            });
        }
    }

    return (
        <LolaPage>
            <LolaHeader
                title="Add New Resident"
                subtitle="One field per row, large inputs, and inline helper text."
                backHref="/residents"
            />
            <LolaCard>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-base font-semibold text-slate-800" htmlFor="firstName">First Name</FormLabel>
                                    <FormControl>
                                        <LolaInput id="firstName" placeholder="Juan" {...field} />
                                    </FormControl>
                                    <p className="text-sm text-slate-600">Enter the given name as it appears on IDs.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-base font-semibold text-slate-800" htmlFor="lastName">Last Name</FormLabel>
                                    <FormControl>
                                        <LolaInput id="lastName" placeholder="Dela Cruz" {...field} />
                                    </FormControl>
                                    <p className="text-sm text-slate-600">Use the legal family name for matching records.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="purok"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-base font-semibold text-slate-800" htmlFor="purok">Purok</FormLabel>
                                    <FormControl>
                                        <LolaInput id="purok" placeholder="Purok 1" {...field} />
                                    </FormControl>
                                    <p className="text-sm text-slate-600">Specify the exact zone to avoid duplicates.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-end">
                            <LolaPrimaryButton type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save Resident"}
                            </LolaPrimaryButton>
                        </div>
                    </form>
                </Form>
            </LolaCard>
        </LolaPage>
    );
}
