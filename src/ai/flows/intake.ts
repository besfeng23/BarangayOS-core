'use server';
/**
 * @fileOverview AI-powered intake automation flow.
 *
 * This flow takes unstructured text (like from an SMS or chat) and
 * attempts to extract structured data for a blotter case, providing
 * follow-up questions to fill in any gaps.
 */

import { ai } from '@/ai/genkit';
import { IntakeInputSchema, IntakeOutputSchema, type IntakeInput } from '@/ai/schemas';

export const intakeFlow = ai.defineFlow({
  name: 'intakeFlow',
  inputSchema: IntakeInputSchema,
  outputSchema: IntakeOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');
  const result = await llm.generate({
    prompt: `You are an expert intake officer for a Philippine barangay. Your task is to parse unstructured text from a message and extract fields for a blotter report.

The fields to extract are:
- complainantName: The full name of the person reporting the incident.
- respondentName: The full name of the person being complained about.
- incidentDate: The date of the incident (YYYY-MM-DD format if possible).
- location: The location where the incident occurred.
- narrative: A summary of what happened.

After extracting the data, provide a confidence score from 0.0 to 1.0 on how certain you are about the extracted fields.

Finally, generate 1-3 simple follow-up questions in Tagalog to ask the user to clarify any missing or ambiguous information.

Here is the user's message:
'''
${input.text}
'''

Provide the structured output.
`,
    output: {
      schema: IntakeOutputSchema,
    },
  });

  return result.output!;
});

export async function parseIntake(input: IntakeInput) {
  const output = await intakeFlow(input);
  return output;
}
