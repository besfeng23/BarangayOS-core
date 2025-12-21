import { z } from 'zod';

// ==================================================================
// Drafting Schemas
// ==================================================================
export const DraftInputSchema = z.object({
  context: z.string().describe('The existing text or context to draft from.'),
  instruction: z.string().describe('The user instruction, e.g., "make it more formal", "summarize in 3 bullet points".'),
});
export type DraftInput = z.infer<typeof DraftInputSchema>;

export const DraftOutputSchema = z.object({
  draft: z.string().describe('The generated draft text.'),
});
export type DraftOutput = z.infer<typeof DraftOutputSchema>;

// ==================================================================
// Natural Language Query (NLQ) Schemas
// ==================================================================
export const NLQInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
  context: z.string().describe('Optional context, e.g., current page or module.'),
});
export type NLQInput = z.infer<typeof NLQInputSchema>;

export const NLQOutputSchema = z.object({
  filters: z.array(z.object({
    field: z.string().describe('The database field to filter on, e.g., "purok", "status", "category".'),
    operator: z.enum(['equals', 'startsWith', 'contains']).describe('The comparison operator.'),
    value: z.any().describe('The value to filter by.'),
  })).describe('An array of structured filters derived from the query. Empty if none found.'),
  keywords: z.array(z.string()).describe('Remaining keywords from the query after filters are extracted.'),
  targetModule: z.enum(['residents', 'blotter', 'permits', 'unknown']).describe('The most likely module the user is searching for.'),
});
export type NLQOutput = z.infer<typeof NLQOutputSchema>;

// ==================================================================
// Help Assistant Schemas
// ==================================================================
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

// ==================================================================
// Public Chat Assistant Schemas
// ==================================================================
export const ChatInputSchema = z.object({
  query: z.string().describe("The user's question for the chat assistant."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe("The conversation history."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's helpful response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// ==================================================================
// Intake Automation Schemas
// ==================================================================
export const IntakeInputSchema = z.object({
  text: z.string().describe('The unstructured text to parse.'),
});
export type IntakeInput = z.infer<typeof IntakeInputSchema>;

export const IntakeOutputSchema = z.object({
  complainantName: z.string().optional().describe('The full name of the person reporting the incident.'),
  respondentName: z.string().optional().describe('The full name of the person being complained about.'),
  incidentDate: z.string().optional().describe('The date of the incident (YYYY-MM-DD format if possible).'),
  location: z.string().optional().describe('The location where the incident occurred.'),
  narrative: z.string().optional().describe('A summary of what happened.'),
  confidence: z.number().min(0).max(1).describe('The confidence score from 0.0 to 1.0.'),
  followUpQuestions: z.array(z.string()).describe('Follow-up questions to clarify missing information.'),
});
export type IntakeOutput = z.infer<typeof IntakeOutputSchema>;

// ==================================================================
// Moderation Schemas
// ==================================================================
export const ModerateInputSchema = z.object({
  text: z.string().describe('The text to moderate.'),
});
export type ModerateInput = z.infer<typeof ModerateInputSchema>;

export const ModerateOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the text is compliant with standards.'),
  suggestions: z.array(z.string()).describe('Non-blocking suggestions for improvement.'),
});
export type ModerateOutput = z.infer<typeof ModerateOutputSchema>;
