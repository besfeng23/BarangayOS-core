import { NextResponse } from 'next/server';
import { draft } from '@/ai/flows/draft';
import { DraftInputSchema } from '@/ai/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input with Zod
    const validatedInput = DraftInputSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json({ error: 'Invalid input', details: validatedInput.error.format() }, { status: 400 });
    }

    const { context, instruction } = validatedInput.data;

    // Call the server-side AI function
    const result = await draft({ context, instruction });

    if (result?.draft) {
      return NextResponse.json({ draft: result.draft });
    } else {
      throw new Error('The AI did not return a valid draft.');
    }

  } catch (error: any) {
    console.error('[AI DRAFT API] Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
