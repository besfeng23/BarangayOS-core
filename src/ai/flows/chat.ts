
'use server';
/**
 * @fileOverview Public-facing chat assistant for the BarangayOS landing page.
 *
 * This flow is designed to answer questions about the BarangayOS product.
 * It has strict PII redaction and a persona focused on being a helpful
 * sales and support assistant for potential customers.
 */

import { ai } from '@/ai/genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';

export const chatFlow = ai.defineFlow({
  name: 'chatFlow',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');

  const result = await llm.generate({
    prompt: `You are the "BOS Assistant", a friendly and professional AI assistant for BarangayOS, a digital governance platform for local government units in the Philippines.
Your goal is to answer questions from potential customers visiting the website.

- Keep answers concise and helpful (2-4 sentences).
- If asked about pricing, state that BarangayOS is deployed via partners like PLDT and to contact sales for a quote.
- If asked about technical specs, highlight key features: offline-first, print-ready, secure, and compliant with Philippine laws (RA 11032, PD 1508).
- Do not make up features. Stick to what's in the product documentation.
- Politely decline to answer questions not related to BarangayOS.
- NEVER ask for or store personally identifiable information (PII). All user input is automatically redacted.

Current conversation history:
${input.history?.map(h => `${h.role}: ${h.content}`).join('\n') || 'No history.'}

User's latest question: "${input.query}"

Provide your helpful and professional answer in the 'response' output field.
`,
    output: {
      schema: ChatOutputSchema,
    },
  });

  return result.output!;
});

export async function chat(input: ChatInput) {
  // Always redact PII for the public-facing chat flow.
  const redactedQuery = redactPII(input.query);
  const redactedHistory = input.history?.map(h => ({ ...h, content: redactPII(h.content) })) || [];
  
  const output = await chatFlow({ query: redactedQuery, history: redactedHistory });
  return output;
}
