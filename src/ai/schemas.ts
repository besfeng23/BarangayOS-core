
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

export const NLQInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
  context: z.string().describe('Optional context, e.g., current page or module.'),
});
export type NLQInput = z.infer<typeof NLQInputSchema>;

export const NLQOutputSchema = z.object({
  filters: z.array(z.object({
    field: z.string().describe('The database field to filter on, e.g., "purok", "status", "category".'),
    operator: z.enum(['equals', 'startsWith', 'contains']).describe('The comparison operator.'),
    value: z.string().describe('The value to filter by.'),
  })).describe('An array of structured filters derived from the query. Empty if none found.'),
  keywords: z.array(z.string()).describe('Remaining keywords from the query after filters are extracted.'),
  targetModule: z.enum(['residents', 'blotter', 'permits', 'unknown']).describe('The most likely module the user is searching for.'),
});
export type NLQOutput = z.infer<typeof NLQOutputSchema>;


// New schemas for the Help Assistant
export const HelpInputSchema = z.object({
  query: z.string().describe("The user's question for the help assistant."),
  context: z.string().describe("The current page or module the user is on."),
  errorContext: z.string().optional().describe("Any relevant error message or code."),
});
export type HelpInput = z.infer<typeof HelpInputSchema>;

export const HelpOutputSchema = z.object({
  response: z.string().describe("The AI assistant's helpful response."),
});
export type HelpOutput = z.infer<typeof HelpOutputSchema>;
