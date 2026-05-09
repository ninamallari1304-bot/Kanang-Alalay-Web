const generateRandomPassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums  = '0123456789';
    const spec  = '!@#$%^&*';
    const all   = upper + lower + nums + spec;

    const pwd = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        nums[Math.floor(Math.random() * nums.length)],
        spec[Math.floor(Math.random() * spec.length)],
    ];
    for (let i = 4; i < 12; i++) {
        pwd.push(all[Math.floor(Math.random() * all.length)]);
    }
    return pwd.sort(() => Math.random() - 0.5).join('');
};

const generateUsername = (firstName, lastName) => {
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}${suffix}`;
};

module.exports = { generateRandomPassword, generateUsername };