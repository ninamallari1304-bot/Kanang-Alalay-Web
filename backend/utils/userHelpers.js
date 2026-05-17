/**
 * utils/userHelpers.js
 *
 * Utility functions for user account creation.
 * Place this file at:  backend/utils/userHelpers.js
 */

const crypto = require('crypto');

/**
 * generateRandomPassword
 *
 * Generates a secure temporary password that satisfies common requirements:
 *   - At least 10 characters
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one digit
 *   - At least one special character
 *
 * @returns {string}
 */
function generateRandomPassword() {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // no I, O (confusing)
    const lower   = 'abcdefghjkmnpqrstuvwxyz';     // no i, l, o
    const digits  = '23456789';                     // no 0, 1 (confusing)
    const special = '@#$%&*!';

    const all = upper + lower + digits + special;

    // Guarantee at least one of each required character class
    const guaranteed = [
        upper  [crypto.randomInt(upper.length)],
        lower  [crypto.randomInt(lower.length)],
        digits [crypto.randomInt(digits.length)],
        special[crypto.randomInt(special.length)],
    ];

    // Fill the remaining 6 characters from the full pool
    const rest = Array.from({ length: 6 }, () => all[crypto.randomInt(all.length)]);

    // Shuffle so the guaranteed chars aren't always at the front
    const combined = [...guaranteed, ...rest];
    for (let i = combined.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
}

/**
 * generateUsername
 *
 * Builds a username from firstName + lastName + a short random suffix.
 * Examples:
 *   Ashley Elma  → ashleyelma_4k2
 *   Maria Santos → mariasantos_9xw
 *
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function generateUsername(firstName, lastName) {
    const base = (firstName + lastName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')   // strip spaces, accents, symbols
        .slice(0, 16);                // keep it reasonable

    // 3-char alphanumeric suffix for uniqueness
    const suffix = crypto.randomBytes(2).toString('hex').slice(0, 3);

    return `${base}_${suffix}`;
}

module.exports = { generateRandomPassword, generateUsername };