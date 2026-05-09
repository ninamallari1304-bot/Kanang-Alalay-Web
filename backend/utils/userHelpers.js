const generateRandomPassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const special = '!@#$%^&*';
    const allChars = upper + lower + nums + special;

    const password = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        nums[Math.floor(Math.random() * nums.length)],
        special[Math.floor(Math.random() * special.length)],
    ];

    for (let i = 4; i < 12; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    return password.sort(() => Math.random() - 0.5).join('');
};

const generateUsername = (firstName, lastName) => {
    const base = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${base}${randomSuffix}`;
};

module.exports = { generateRandomPassword, generateUsername };