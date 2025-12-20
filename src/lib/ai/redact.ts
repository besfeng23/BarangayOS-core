
const PHONE_REGEX = /(\+\d{1,3}[- ]?)?\d{10,11}/g;
const EMAIL_REGEX = /[\w.-]+@[\w-]+\.[\w.-]+/g;

// Very basic name detection - this is hard and should be improved.
// This looks for sequences of 2-3 capitalized words.
const NAME_REGEX = /([A-Z][a-z]+(?=\s[A-Z])(?:\s[A-Z][a-z]+){1,2})/g;

// Address-like strings
const ADDRESS_REGEX = /(\d{1,5}\s+[\w\s]+(St|Street|Ave|Avenue|Blvd|Lane|Road))/g;


export function redactPII(text: string): string {
    let redactedText = text;
    redactedText = redactedText.replace(PHONE_REGEX, '[REDACTED_PHONE]');
    redactedText = redactedText.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    redactedText = redactedText.replace(NAME_REGEX, '[REDACTED_NAME]');
    redactedText = redactedText.replace(ADDRESS_REGEX, '[REDACTED_ADDRESS]');
    return redactedText;
}
