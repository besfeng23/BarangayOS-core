
'use server';
/**
 * @fileOverview Natural Language Query (NLQ) flow using Genkit Tools.
 *
 * This file defines the `nlq` function, which uses an AI model to convert
 * a user's natural language search query into a structured JSON filter object
 * by leveraging modern Genkit tool-based functionality.
 */

import { ai } from '@/ai/genkit';
import { NLQInputSchema, NLQOutputSchema, type NLQInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';
import { getSettingsSnapshot } from '@/lib/bos/print/getSettingsSnapshot';
import { z } from 'zod';

const ResidentsFilterSchema = z.object({
  purok: z.string().describe('Filter by purok or zone number.'),
  status: z.enum(['active', 'inactive']).describe('Filter by resident status.'),
});

const BlotterFilterSchema = z.object({
    status: z.enum(['active', 'settled']).describe('Filter by case status.'),
    caseNumber: z.string().describe('Filter by a specific case number.'),
});

const PermitsFilterSchema = z.object({
    status: z.enum(['active', 'expired']).describe('Filter by permit status.'),
    category: z.string().describe('Filter by business category, e.g., "sari-sari store".'),
});

const searchResidentsTool = ai.defineTool({
    name: 'searchResidents',
    description: 'Search for residents based on criteria.',
    inputSchema: ResidentsFilterSchema,
    outputSchema: z.any(),
}, async () => { /* No-op, tool call is intercepted */ });

const searchBlotterTool = ai.defineTool({
    name: 'searchBlotter',
    description: 'Search for blotter cases based on criteria.',
    inputSchema: BlotterFilterSchema,
    outputSchema: z.any(),
}, async () => { /* No-op, tool call is intercepted */ });

const searchPermitsTool = ai.defineTool({
    name: 'searchPermits',
    description: 'Search for business permits based on criteria.',
    inputSchema: PermitsFilterSchema,
    outputSchema: z.any(),
}, async () => { /* No-op, tool call is intercepted */ });


const nlqPrompt = ai.definePrompt({
    name: 'nlqPrompt',
    tools: [searchResidentsTool, searchBlotterTool, searchPermitsTool],
    prompt: `You are a search query parser for BarangayOS.
    The user's query is: "{{query}}".
    The user's current page context is: "{{context}}".
    Your job is to determine the correct tool to call based on the query and context.
    Any part of the query that is not used by a tool should be considered a keyword.
    `,
});

export const nlqFlow = ai.defineFlow(
  {
    name: 'nlqFlow',
    inputSchema: NLQInputSchema,
    outputSchema: NLQOutputSchema,
  },
  async (input) => {
    const llmResponse = await nlqPrompt(input);
    const toolRequest = llmResponse.toolRequest;

    if (!toolRequest) {
      return {
        targetModule: 'unknown',
        filters: [],
        keywords: input.query.split(' '),
      };
    }

    const toolInput = toolRequest.input || {};
    const keywords = new Set(input.query.toLowerCase().split(' '));
    const filters: { field: string, operator: 'equals', value: string }[] = [];

    let targetModule: 'residents' | 'blotter' | 'permits' | 'unknown' = 'unknown';

    if (toolRequest.name === 'searchResidents') targetModule = 'residents';
    if (toolRequest.name === 'searchBlotter') targetModule = 'blotter';
    if (toolRequest.name === 'searchPermits') targetModule = 'permits';

    for (const [key, value] of Object.entries(toolInput)) {
        if(value) {
            filters.push({ field: key, operator: 'equals', value: String(value) });
            // Naively remove used values from keywords
            String(value).toLowerCase().split(' ').forEach(v => keywords.delete(v));
            keywords.delete(key.toLowerCase());
        }
    }
    
    // Remove common words that are likely part of the filter structure
    ['in', 'purok', 'status', 'active', 'settled', 'expired', 'cases', 'residents', 'of'].forEach(w => keywords.delete(w));

    return {
      targetModule,
      filters,
      keywords: Array.from(keywords),
    };
  }
);


export async function nlq(input: NLQInput) {
  const settings = await getSettingsSnapshot();
  const allowPII = settings.ai?.allowPII ?? false;
  const redactedQuery = allowPII ? input.query : redactPII(input.query);

  const output = await nlqFlow({ ...input, query: redactedQuery });
  return output;
}
