const express = require('express');
const router = express.Router();
const Resident = require('../models/Resident');

router.get('/my-assigned', async (req, res) => {
  try {
    const residents = await Resident.find();

    const schedules = residents
      .filter((r) => r.medications && r.medications.length > 0)
      .map((resident) => ({
        _id: resident._id,
        residentName: resident.fullName || `${resident.firstName || ''} ${resident.lastName || ''}`.trim(),
        room: resident.room || resident.roomNumber,
        bed: resident.bed,
        age: resident.age,
        conditions: resident.conditions || [],
        allergies: resident.allergies || '',
        medications: resident.medications.map((med) => ({
          _id: med._id,
          name: med.name,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          scheduleTime: med.scheduleTime || 'No time',
          status: med.status || 'active',
        })),
      }));

    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

module.exports = router;
