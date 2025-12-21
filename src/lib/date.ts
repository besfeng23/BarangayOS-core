
import { DateTime } from 'luxon';

/**
 * Returns the current date and time in the 'Asia/Manila' timezone.
 * @returns {string} The formatted date and time string (e.g., "YYYY-MM-DD").
 */
export function getManilaDate(): string {
  return DateTime.now().setZone('Asia/Manila').toISODate();
}

/**
 * Returns a Luxon DateTime object for yesterday in the 'Asia/Manila' timezone.
 * @returns {string} The formatted date string for yesterday.
 */
export function getManilaYesterday(): string {
  return DateTime.now().setZone('Asia/Manila').minus({ days: 1 }).toISODate();
}
