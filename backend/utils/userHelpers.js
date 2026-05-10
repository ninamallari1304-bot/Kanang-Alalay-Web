/**
 * userHelpers.js
 * Utility functions for auto-generating user credentials.
 */

/**
 * Generates a secure 12-character random password containing
 * uppercase letters, lowercase letters, digits, and special characters.
 * @returns {string}
 */
const generateRandomPassword = () => {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';        // no I / O (visually ambiguous)
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';                         // no 0 / 1
    const special = '!@#$%^&*';

    // Guarantee at least one of each character class
    const required = [
        upper[Math.floor(Math.random() * upper.length)],
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        lower[Math.floor(Math.random() * lower.length)],
        digits[Math.floor(Math.random() * digits.length)],
        digits[Math.floor(Math.random() * digits.length)],
        special[Math.floor(Math.random() * special.length)],
        special[Math.floor(Math.random() * special.length)],
    ];

    const all = upper + lower + digits + special;
    const remaining = Array.from({ length: 4 }, () =>
        all[Math.floor(Math.random() * all.length)]
    );

    // Shuffle the combined array so the guaranteed chars aren't always first
    const combined = [...required, ...remaining];
    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
};

/**
 * Generates a username in the format `firstname.lastname###`
 * where ### is a random 3-digit number (100-999).
 * The result is always lowercase.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
const generateUsername = (firstName, lastName) => {
    const clean = (str) =>
        str
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''); // strip spaces, accents, special chars

    const suffix = Math.floor(100 + Math.random() * 900); // 100–999
    return `${clean(firstName)}.${clean(lastName)}${suffix}`;
};

module.exports = { generateRandomPassword, generateUsername };