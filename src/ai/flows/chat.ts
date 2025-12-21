
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

const chatSystemPrompt = `You are BarangAI, the official AI assistant of BarangayOS (BOS). Help users understand BOS features and workflows. Be professional, calm, and lola-proof. Default English. Switch to Tagalog only if user uses Tagalog first. Never request or store personal data; if present, it is already redacted. Do not provide legal advice. Give step-by-step guidance.`;

export const chatFlow = ai.defineFlow({
  name: 'chatFlow',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');

  const result = await llm.generate({
    prompt: `
      ${chatSystemPrompt}

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
