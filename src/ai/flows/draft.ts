'use server';
/**
 * @fileOverview AI-powered drafting assistant flow.
 */

import { ai } from '@/ai/genkit';
import { DraftInputSchema, DraftOutputSchema, type DraftInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';

const draftingPrompt = ai.definePrompt({
  name: 'draftingPrompt',
  input: { schema: DraftInputSchema },
  output: { schema: DraftOutputSchema },
  prompt: `You are an expert administrative assistant for a local government unit.
Your task is to help the user draft or refine text based on their instructions.
The user's instruction is: {{instruction}}

The text to be refined is:
'''
{{context}}
'''

Provide the redrafted text in the 'draft' output field.
`,
});

export async function draft(input: DraftInput) {
  const redactedContext = redactPII(input.context);

  const { output } = await draftingPrompt({
    ...input,
    context: redactedContext,
  });

  return output;
}
