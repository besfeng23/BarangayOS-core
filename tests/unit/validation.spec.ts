import { describe, expect, it } from 'vitest';
import { blotterSchema, permitFormSchema } from '../../src/lib/validation/schemas';

describe('Validation Schemas', () => {
  it('rejects incomplete blotter drafts', () => {
    const result = blotterSchema.safeParse({
      incidentDateISO: '',
      locationText: '',
      complainant: { mode: 'resident', residentId: null, residentNameSnapshot: '' },
      respondent: { mode: 'resident', residentId: null, residentNameSnapshot: '' },
      narrative: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid blotter draft', () => {
    const parsed = blotterSchema.safeParse({
      incidentDateISO: '2024-12-12',
      locationText: 'Barangay Hall',
      complainant: { mode: 'resident', residentId: '1', residentNameSnapshot: 'Juan Dela Cruz' },
      respondent: { mode: 'resident', residentId: '2', residentNameSnapshot: 'Pedro Penduko' },
      narrative: 'Test narrative with enough length.',
      actionsTaken: '',
      settlement: '',
      notes: '',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid permit form', () => {
    const result = permitFormSchema.safeParse({
      resident: null,
      businessName: '',
      businessType: '',
      address: '',
      fees: 0,
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid permit form', () => {
    const parsed = permitFormSchema.safeParse({
      resident: { id: '1', displayName: 'Resident Owner' },
      businessName: 'Demo Store',
      businessType: 'Sari-Sari Store',
      address: '123 Sample St.',
      fees: 500,
    });
    expect(parsed.success).toBe(true);
  });
});
