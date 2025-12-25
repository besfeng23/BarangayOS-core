
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addResident } from '../_actions/addResident';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    purok: z.string().min(1, "Purok is required"),
});

export default function NewResidentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            purok: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setServerError(null);
        
        try {
            const result = await addResident(values);
            
            if (result.success) {
                toast({
                    title: "Resident Added",
                    description: "The new resident has been saved successfully.",
                });
                router.push('/residents');
            } else {
                setServerError(result.error || 'An unknown error occurred');
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: result.error || 'Failed to add resident',
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setServerError(errorMessage);
            toast({
                variant: 'destructive',
                title: "Error",
                description: errorMessage,
            });
        }
    }

    return (
        <div className="mx-auto w-full max-w-xl p-4 md:p-6">
            <div className="mb-6">
                <Link 
                    href="/residents" 
                    className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Residents
                </Link>
            </div>
            
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-zinc-800">
                        <UserPlus className="h-6 w-6 text-zinc-100" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Add New Resident</h1>
                        <p className="text-sm text-zinc-400">Enter the resident&apos;s basic information</p>
                    </div>
                </div>

                {serverError && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200 text-sm">
                        {serverError}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-200">First Name *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Juan" 
                                            className="h-12 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-200">Last Name *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Dela Cruz" 
                                            className="h-12 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="purok"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-200">Purok / Zone *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Purok 1" 
                                            className="h-12 bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline"
                                className="flex-1 h-12 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                onClick={() => router.push('/residents')}
                                disabled={form.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex-1 h-12 bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Resident"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
