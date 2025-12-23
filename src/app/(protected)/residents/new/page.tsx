
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addResident } from '../_actions/addResident';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

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
        <div className="mx-auto w-full max-w-xl p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-4">Add New Resident</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Juan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Dela Cruz" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="purok"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Purok</FormLabel>
                                <FormControl>
                                    <Input placeholder="Purok 1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Resident"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
