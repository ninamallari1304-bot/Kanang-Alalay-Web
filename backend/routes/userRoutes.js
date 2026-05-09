const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.put('/update-profile', protect, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            address,
            shift,
            assignedFloor,
            assignedRoom,
            newPassword
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (firstName !== undefined) user.firstName = firstName.trim();
        if (lastName !== undefined) user.lastName = lastName.trim();
        if (phone !== undefined) user.phone = phone.trim();

        if (address) {
            user.address = {
                street: address.street || user.address?.street || '',
                city: address.city || user.address?.city || '',
                province: address.province || user.address?.province || '',
                zipCode: address.zipCode || user.address?.zipCode || ''
            };
        }

        if (shift !== undefined) user.shift = shift;
        if (assignedFloor !== undefined) user.assignedFloor = assignedFloor;
        if (assignedRoom !== undefined) user.assignedRoom = assignedRoom;

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters.'
                });
            }

            if (!/[A-Z]/.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least one uppercase letter.'
                });
            }
            if (!/[0-9]/.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least one number.'
                });
            }

            user.password = newPassword;
        }

        user.isFirstLogin = false;
        user.needsProfileUpdate = false;
        user.temporaryPassword = undefined;
        user.tempPasswordExpires = undefined;
        user.verificationOtp = undefined;
        user.verificationOtpExpires = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                staffId: user.staffId,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                phone: user.phone,
                shift: user.shift,
                assignedFloor: user.assignedFloor,
                assignedRoom: user.assignedRoom,
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

module.exports = router;