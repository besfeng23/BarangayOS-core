
'use server';
/**
 * @fileOverview AI-powered drafting assistant flow.
 *
 * This file defines the `draft` function, which uses an AI model to refine
 * or rewrite text based on a user's instructions. It ensures that any
 * personally identifiable information (PII) is redacted from the context
 * before it's sent to the AI model.
 *
 * - draft: The main function to call for drafting assistance.
 * - DraftInput: The Zod schema for the input object.
 * - DraftOutput: The Zod schema for the output object.
 */

import { ai } from '@/ai/genkit';
import { DraftInputSchema, DraftOutputSchema, type DraftInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';
import {defineFlow} from 'genkit';


export const draftingPrompt = defineFlow({
  name: 'draftingPrompt',
  inputSchema: DraftInputSchema,
  outputSchema: DraftOutputSchema,
}, async (input) => {
    const llm = ai.getGenerator('googleai/gemini-1.5-flash');
    const result = await llm.generate({
        prompt: `You are an expert administrative assistant for a local government unit.
Your task is to help the user draft or refine text based on their instructions.
The user's instruction is: ${input.instruction}

The text to be refined is:
'''
${input.context}
'''

Provide the redrafted text in the 'draft' output field.
`,
        output: {
            schema: DraftOutputSchema,
        },
    });

    return result.output!;
});

export async function draft(input: DraftInput) {
  const redactedContext = redactPII(input.context);

  const output = await draftingPrompt({
    ...input,
    context: redactedContext,
  });

  return output;
}
