/**
 * Generates a 6-digit numeric code as a string.
 *
 * @returns {string} A 6-digit numeric code.
 */
export function generateEmailCodeHelper(): string{
    return Math.floor(100000 + Math.random() * 900000).toString();
}