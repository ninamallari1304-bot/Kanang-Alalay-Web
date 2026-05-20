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
    
    // Fisher-Yates shuffle
    for (let i = combined.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    
    return combined.join('');
}

function generateUsername(firstName, lastName) {
    // Clean and combine first and last name
    const first = (firstName || '').toLowerCase().replace(/[^a-z]/g, '');
    const last = (lastName || '').toLowerCase().replace(/[^a-z]/g, '');
    let base = first + last;
    
    // If base is empty, use a default
    if (base.length === 0) {
        base = 'user';
    }
    
    // Truncate to reasonable length
    base = base.slice(0, 12);
    
    // Add random suffix for uniqueness
    const suffix = crypto.randomBytes(3).toString('hex');
    
    return `${base}_${suffix}`;
}

module.exports = { generateRandomPassword, generateUsername };