
'use server';
/**
 * @fileOverview Natural Language Query (NLQ) flow.
 *
 * This file defines the `nlq` function, which uses an AI model to convert
 * a user's natural language search query into a structured JSON filter object.
 * This allows for more intuitive searching within the application.
 */

import { ai } from '@/ai/genkit';
import { NLQInputSchema, NLQOutputSchema, type NLQInput } from '@/ai/schemas';
import { redactPII } from '@/lib/ai/redact';
import { getSettingsSnapshot } from '@/lib/bos/print/getSettingsSnapshot';


export const nlqFlow = ai.defineFlow({
  name: 'nlqFlow',
  inputSchema: NLQInputSchema,
  outputSchema: NLQOutputSchema,
}, async (input) => {
  const llm = ai.getGenerator('googleai/gemini-1.5-flash');

  const result = await llm.generate({
    prompt: `You are a search query parser for a local government application called BarangayOS.
Your task is to convert a user's natural language query into a structured filter object.

The available modules and their filterable fields are:
- residents: "purok", "status" (active, inactive)
- blotter: "status" (active, settled), "caseNumber"
- permits: "status" (active, expired), "category"

Given the user query, identify the target module and extract relevant filters.
The user query is: "${input.query}"
Context (current page): "${input.context}"

- Identify the most likely target module ('residents', 'blotter', 'permits', or 'unknown').
- Extract key-value pairs for filtering. The field name must be one of the available fields for the target module.
- Any remaining parts of the query that are not filters should be returned as keywords.
- For example, "active blotter cases about theft" should result in targetModule: 'blotter', filters: [{field: 'status', operator: 'equals', value: 'active'}], keywords: ['theft'].
- "residents in purok 3" should result in targetModule: 'residents', filters: [{field: 'purok', operator: 'equals', value: '3'}], keywords: [].

Provide the result as a structured JSON object.
`,
    output: {
      schema: NLQOutputSchema,
    },
  });

  return result.output!;
});

export async function nlq(input: NLQInput) {
  const settings = await getSettingsSnapshot();
  const allowPII = settings.ai?.allowPII ?? false;
  const redactedQuery = allowPII ? input.query : redactPII(input.query);

  const output = await nlqFlow({ ...input, query: redactedQuery });
  return output;
}
