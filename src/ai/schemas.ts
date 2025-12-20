
import { z } from 'zod';

export const DraftInputSchema = z.object({
  context: z.string().describe('The existing text or context to draft from.'),
  instruction: z.string().describe('The user instruction, e.g., "make it more formal", "summarize in 3 bullet points".'),
});
export type DraftInput = z.infer<typeof DraftInputSchema>;

export const DraftOutputSchema = z.object({
  draft: z.string().describe('The generated draft text.'),
});
export type DraftOutput = z.infer<typeof DraftOutputSchema>;
