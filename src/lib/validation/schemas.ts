import { z } from 'zod';

export const partySchema = z.object({
  mode: z.enum(['resident', 'manual']),
  residentId: z.string().nullable().optional(),
  residentNameSnapshot: z.string().optional(),
  manualName: z.string().optional(),
}).refine((val) => {
  if (val.mode === 'resident') return Boolean(val.residentId && val.residentNameSnapshot);
  return Boolean(val.manualName && val.manualName.trim().length > 1);
}, { message: "Kailangan pumili o maglagay ng pangalan." });

export const blotterSchema = z.object({
  incidentDateISO: z.string().min(1, "Kailangan ang petsa ng insidente."),
  locationText: z.string().trim().min(3, "Kailangan ang lokasyon ng insidente."),
  complainant: partySchema,
  respondent: partySchema,
  narrative: z.string().trim().min(10, "Ilagay ang salaysay ng pangyayari."),
  actionsTaken: z.string().optional(),
  settlement: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Resolved"]).optional(),
});

export const permitFormSchema = z.object({
  resident: z.object({ id: z.string(), displayName: z.string() }).nullable(),
  businessName: z.string().min(2, "Business name is required."),
  businessType: z.string().min(1, "Business type is required."),
  address: z.string().min(3, "Business address is required."),
  fees: z.coerce.number().positive("Fees must be greater than 0."),
});
