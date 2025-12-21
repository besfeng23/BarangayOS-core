'use server';
/**
 * @fileOverview AI-powered content moderation flow.
 *
 * This flow scans text for potentially risky or non-compliant content,
 * such as defamatory language or missing required elements for an
 * official report.
 */

import { ai } from '@/ai/genkit';
import { ModerateInputSchema, ModerateOutputSchema, type ModerateInput } from '@/ai/schemas';

export const moderationFlow = ai.defineFlow({
  name: 'moderationFlow',
  inputSchema: ModerateInputSchema,
  outputSchema: ModerateOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');
  const result = await llm.generate({
    prompt: `You are a compliance officer for a Philippine LGU. Your task is to review a blotter narrative for potential issues.

Check for the following:
- Defamatory language (accusations without evidence, insults).
- Missing critical information (like date, time, specific actions).
- Inconsistent details (e.g., dates that don't make sense).

If issues are found, set 'isCompliant' to false and provide a brief, non-blocking suggestion for improvement in the 'suggestions' field. If the text is fine, set 'isCompliant' to true.

The text to review is:
'''
${input.text}
'''

Provide the structured compliance output.
`,
    output: {
      schema: ModerateOutputSchema,
    },
  });

  return result.output!;
});

export async function moderate(input: ModerateInput) {
  const output = await moderationFlow(input);
  return output;
}
