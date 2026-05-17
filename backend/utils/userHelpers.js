const crypto = require('crypto');

function generateRandomPassword() {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';
    const special = '@#$%&*!';
    const all = upper + lower + digits + special;

    const guaranteed = [
        upper  [crypto.randomInt(upper.length)],
        lower  [crypto.randomInt(lower.length)],
        digits [crypto.randomInt(digits.length)],
        special[crypto.randomInt(special.length)],
    ];

    const rest = Array.from({ length: 6 }, () => all[crypto.randomInt(all.length)]);
    const combined = [...guaranteed, ...rest];
    for (let i = combined.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined.join('');
}

function generateUsername(firstName, lastName) {
    const base = (firstName + lastName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16);
    const suffix = crypto.randomBytes(2).toString('hex').slice(0, 3);
    return `${base}_${suffix}`;
}

module.exports = { generateRandomPassword, generateUsername };
