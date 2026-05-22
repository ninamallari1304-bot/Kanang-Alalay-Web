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

// GET /api/residents/assigned  — residents assigned to logged-in user
router.get('/assigned', protect, async (req, res) => {
    try {
        const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        const query = ['admin', 'head_caregiver'].includes(req.user.role)
            ? { status: 'active' }
            : {
                status: 'active',
                $or: [
                    { primaryCaregiverId: req.user._id },
                    { primaryCaregiverName: userName },
                    { primaryCaregiver: userName },
                    { assignedNurse: userName },
                    { assignedCaregiver: userName },
                    { 'assignedStaff.primaryCaregiverId': req.user._id },
                    { 'assignedStaff.primaryCaregiverName': userName },
                    { 'assignedStaff.primaryCaregiver': userName },
                    { 'assignedStaff.assignedNurse': userName },
                    { 'assignedStaff.assignedCaregiver': userName }
                ]
            };

        const residents = await Resident.find(query).sort({ roomNumber: 1 });
        res.json({ success: true, data: residents, count: residents.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching assigned residents' });
    }
});

router.get('/:id/care-notes', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, data: resident.careNotes || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching care notes' });
    }
});

router.post('/:id/care-notes', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        const note = {
            note: req.body.note,
            nurseName: req.user.firstName ? `${req.user.firstName} ${req.user.lastName}`.trim() : 'Nurse'
        };
        resident.careNotes = resident.careNotes || [];
        resident.careNotes.push(note);
        await resident.save();
        res.json({ success: true, data: resident.careNotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error adding care note' });
    }
});

router.put('/:id/care-notes/:noteId', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        const note = resident.careNotes.id(req.params.noteId);
        if (!note) return res.status(404).json({ success: false, message: 'Care note not found' });
        note.note = req.body.note || note.note;
        await resident.save();
        res.json({ success: true, data: resident.careNotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating care note' });
    }
});

router.delete('/:id/care-notes/:noteId', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
        const note = resident.careNotes.id(req.params.noteId);
        if (!note) return res.status(404).json({ success: false, message: 'Care note not found' });
        note.remove();
        await resident.save();
        res.json({ success: true, data: resident.careNotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting care note' });
    }
});

router.post('/:id/administer/:medId', protect, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });

        const medication = resident.medications.id(req.params.medId);
        if (!medication) {
            return res.status(404).json({ success: false, message: 'Embedded medication not found' });
        }

        medication.status = 'administered';
        medication.lastAdministered = req.body.administeredAt ? new Date(req.body.administeredAt) : new Date();
        await resident.save();

        res.json({ success: true, data: medication });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error administering medication' });
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
