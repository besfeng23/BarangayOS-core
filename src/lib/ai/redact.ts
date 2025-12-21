
// Basic regex patterns for common PII
const PHONE_REGEX = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g;
const EMAIL_REGEX = /[\w.-]+@[\w-]+\.[\w.-]+/g;

// Looks for sequences of 2-3 capitalized words, a common pattern for names.
// This is a heuristic and may have false positives/negatives.
const NAME_REGEX = /([A-Z][a-z]+(?=\s[A-Z])(?:\s[A-Z][a-z]+){1,2})/g;

// Looks for common address patterns like "123 Main St" or "Blk 4 Lot 5".
const ADDRESS_REGEX = /(\b\d{1,5}\s+[\w\s]+(St|Street|Ave|Avenue|Blvd|Lane|Road)\b)|(\bBlk\s\d+\sLot\s\d+\b)/gi;

/**
 * Redacts common Personally Identifiable Information (PII) from a string.
 * This is a basic implementation and should be enhanced for production use.
 * @param text The input string to redact.
 * @returns The redacted string.
 */
export function redactPII(text: string): string {
    if (!text) return '';
    let redactedText = text;
    redactedText = redactedText.replace(PHONE_REGEX, '[REDACTED_PHONE]');
    redactedText = redactedText.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    redactedText = redactedText.replace(NAME_REGEX, '[REDACTED_NAME]');
    redactedText = redactedText.replace(ADDRESS_REGEX, '[REDACTED_ADDRESS]');
    return redactedText;
}
