const express  = require('express');
const router   = express.Router();
const Resident = require('../models/Resident');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/residents  — all active residents (any authenticated user)
router.get('/', protect, async (req, res) => {
    try {
        const residents = await Resident.find({ status: 'active' })
            .sort({ roomNumber: 1 });
        res.json({ success: true, data: residents, count: residents.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/residents/statistics
router.get('/statistics', protect, async (req, res) => {
    try {
        const totalResidents = await Resident.countDocuments({ status: 'active' });

        const averageAgeAgg = await Resident.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, avgAge: { $avg: '$age' } } }
        ]);

        const conditionStats = await Resident.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$medicalConditions' },
            { $group: { _id: '$medicalConditions.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                totalResidents,
                averageAge:   averageAgeAgg[0]?.avgAge || 0,
                conditionStats
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/residents/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, data: resident });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/residents  — admin only
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const residentId = 'RES' + Date.now().toString().slice(-6);

        const resident = new Resident({ residentId, ...req.body });
        await resident.save();

        res.status(201).json({ success: true, data: resident });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Resident ID already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/residents/:id  — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const resident = await Resident.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });

        res.json({ success: true, data: resident });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/residents/:id  — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, message: 'Resident deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;