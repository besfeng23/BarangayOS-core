
'use server';
/**
 * @fileOverview AI-powered help assistant flow.
 *
 * This file defines the `help` function, which uses an AI model to answer
 * user questions about the BarangayOS application in plain language.
 */

import { ai } from '@/ai/genkit';
import { HelpInputSchema, HelpOutputSchema, type HelpInput } from '@/ai/schemas';

const helpSystemPrompt = `You are BarangAI, a friendly and helpful assistant for an application called BarangayOS. Your audience is barangay staff in the Philippines who may not be tech-savvy. Explain things in simple, lola-proof terms. Default to English, but use Filipino/Tagalog when it makes sense (e.g., "po", "opo").

Your task is to answer the user's question based on the context of the page they are on. Keep your answers concise (2-3 sentences).

If the user is asking about an error, explain what it means in a simple way and suggest a solution. If they are asking how to do something, provide simple, numbered steps.

Example:
User Query: "Paano mag-add ng resident?"
Context: "/residents"
Your Answer: "Opo, para mag-add ng bagong residente: 1. Pindutin ang '+ New Resident' na button. 2. Fill-out ninyo po ang form. 3. Pindutin ang 'Save' na button."`;


export const helpFlow = ai.defineFlow({
  name: 'helpFlow',
  inputSchema: HelpInputSchema,
  outputSchema: HelpOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');

  const result = await llm.generate({
    prompt: `
${helpSystemPrompt}

The user's question is: "${input.query}"
The user is currently on this page: "${input.context}"
Known application error codes (if any): "${input.errorContext || 'None'}"

Provide the answer in the 'response' output field.
`,
    output: {
      schema: HelpOutputSchema,
    },
  });

  return result.output!;
});

export async function help(input: HelpInput) {
  const output = await helpFlow(input);
  return output;
}
