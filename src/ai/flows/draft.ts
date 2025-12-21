
'use server';
/**
 * @fileOverview AI-powered drafting assistant flow.
 *
 * This file defines the `draft` function, which uses an AI model to refine
 * or rewrite text based on a user's instructions. It ensures that any
 * personally identifiable information (PII) is redacted from the context
 * before it's sent to the AI model if the user settings require it.
 *
 * - draft: The main function to call for drafting assistance.
 * - DraftInput: The Zod schema for the input object.
 * - DraftOutput: The Zod schema for the output object.
 */

import { ai } from '@/ai/genkit';
import { DraftInputSchema, DraftOutputSchema, type DraftInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';
import { getSettingsSnapshot } from '@/lib/bos/print/getSettingsSnapshot';


export const draftingPrompt = ai.defineFlow({
  name: 'draftingPrompt',
  inputSchema: DraftInputSchema,
  outputSchema: DraftOutputSchema,
}, async (input) => {
    const llm = ai.getGenerator('googleai/gemini-1.5-flash');
    const result = await llm.generate({
        prompt: `You are an expert administrative assistant for a local government unit in the Philippines.
Your task is to help the user draft or refine text based on their instructions.
The user's instruction is: ${input.instruction}

The text to be refined is:
'''
${input.context}
'''

Provide the redrafted text in the 'draft' output field. Your response must be print-ready and structured if requested.
`,
        output: {
            schema: DraftOutputSchema,
        },
    });

    return result.output!;
});

export async function draft(input: DraftInput) {
  const settings = await getSettingsSnapshot();
  const allowPII = settings.ai?.allowPII ?? false;

  const redactedContext = allowPII ? input.context : redactPII(input.context);

  const output = await draftingPrompt({
    ...input,
    context: redactedContext,
  });

  return output;
}
