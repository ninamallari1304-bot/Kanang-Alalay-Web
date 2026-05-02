const User = require('../models/User');

async function seedDefaultUsers() {
  const defaultUsers = [
    {
      staffId: 'LSAE-ADMIN-0001',
      username: 'admin',
      email: 'admin@kanangalalay.org',
      password: 'admin123',
      firstName: 'Master',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isVerified: true,
      shift: 'morning',
      department: 'Head Office'
    },
    {
      staffId: 'LSAE-CG-0001',
      username: 'caregiver',
      email: 'caregiver@kanangalalay.org',
      password: 'caregiver123',
      firstName: 'Default',
      lastName: 'Caregiver',
      role: 'caregiver',
      isActive: true,
      isVerified: true,
      shift: 'morning',
      department: 'Ward A'
    }
  ];

  for (const userData of defaultUsers) {
    const existing = await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
    if (existing) {
      existing.staffId = existing.staffId || userData.staffId;
      existing.firstName = existing.firstName || userData.firstName;
      existing.lastName = existing.lastName || userData.lastName;
      existing.role = existing.role || userData.role;
      existing.isActive = true;
      existing.isVerified = true;
      existing.shift = existing.shift || userData.shift;
      existing.department = existing.department || userData.department;
      if (userData.password) {
        existing.password = userData.password;
      }
      await existing.save();
      continue;
    }

    const user = new User(userData);
    await user.save();
  }
}

module.exports = { seedDefaultUsers };
