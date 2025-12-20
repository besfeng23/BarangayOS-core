'use server';
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
  query: z.string().describe('The user\'s natural language query, e.g., "show me all seniors from purok 3".'),
});
export type NLQInput = z.infer<typeof NLQInputSchema>;

export const NLQOutputSchema = z.object({
  filters: z.object({
    q: z.string().optional().describe('The transformed keyword search query.'),
    purok: z.string().optional().describe('The specific purok to filter by.'),
    sex: z.string().optional().describe('The gender to filter by.'),
    status: z.string().optional().describe('The resident status to filter by.'),
    tag: z.string().optional().describe('The specific sector tag to filter by (e.g., senior, pwd).'),
  }).describe('The structured filters to be applied.'),
});
export type NLQOutput = z.infer<typeof NLQOutputSchema>;


export const IntakeInputSchema = z.object({
  text: z.string().describe('The raw text from an SMS, chat, or pasted notes.'),
});
export type IntakeInput = z.infer<typeof IntakeInputSchema>;

export const IntakeOutputSchema = z.object({
  structuredData: z.object({
    complainantName: z.string().optional(),
    respondentName: z.string().optional(),
    narrative: z.string().optional(),
    location: z.string().optional(),
  }).describe('The structured data extracted from the text.'),
  followUpQuestions: z.array(z.string()).describe('Questions to ask the user to clarify or get more information.'),
});
export type IntakeOutput = z.infer<typeof IntakeOutputSchema>;

export const ModerationInputSchema = z.object({
  text: z.string().describe('The text to be moderated for compliance and risk.'),
});
export type ModerationInput = z-infer<typeof ModerationInputSchema>;

export const ModerationOutputSchema = z.object({
  issues: z.array(z.object({
    level: z.enum(['info', 'warning', 'critical']),
    message: z.string(),
    suggestion: z.string().optional(),
  })).describe('A list of potential issues found in the text.'),
});
export type ModerationOutput = z.infer<typeof ModerationOutputSchema>;


export const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chat assistant.'),
  context: z.string().optional().describe('The current context of the app (e.g., page name, error codes).'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The chat assistant\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
