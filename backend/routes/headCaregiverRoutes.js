const express = require('express');
const router = express.Router();
const Resident = require('../models/Resident');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Inventory = require('../models/Inventory');
const VitalsLog = require('../models/VitalsLog');
const StockRequest = require('../models/StockRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

function shapeLog(l) {
    const r = l.residentId;
    const m = l.medicationId;
    const isPopulated = r && typeof r === 'object';

    return {
        _id: l._id,
        logId: l.logId,
        residentId: isPopulated ? r._id : l.residentId,
        residentName: l.residentName || (isPopulated ? `${r.firstName} ${r.lastName}` : '—'),
        medicationId: isPopulated && m ? m._id : l.medicationId,
        medicationName: l.medicationName || (isPopulated && m ? m.name : '—'),
        room: l.room || (isPopulated ? r.roomNumber || '' : ''),
        floor: l.floor || (isPopulated ? r.floor || '' : ''),
        bed: l.bed || (isPopulated ? r.bed || '' : ''),
        condition: l.condition || (isPopulated && m ? m.purpose || '' : ''),
        dosage: l.dosage || (isPopulated && m && m.dosage ? `${m.dosage.value}${m.dosage.unit}` : ''),
        frequency: l.frequency || '',
        nextDose: l.nextDose || '',
        scheduledTime: l.scheduledTime,
        administeredTime: l.administeredTime,
        status: l.status,
        notes: l.notes || '',
        verificationMethod: l.verificationMethod,
    };
}

async function autoMarkOverdue(logs) {
    const now = new Date();
    const toUpdate = logs.filter(l =>
        (l.status === 'scheduled' || l.status === 'pending') &&
        l.scheduledTime && new Date(l.scheduledTime) < now
    );
    if (toUpdate.length) {
        const ids = toUpdate.map(l => l._id);
        await MedicationLog.updateMany({ _id: { $in: ids } }, { status: 'overdue' });
        toUpdate.forEach(l => { l.status = 'overdue'; });
    }
    return logs;
}

router.get('/residents', async (req, res) => {
    try {
        const residents = await Resident.find({ status: 'active' }).sort({ roomNumber: 1 });
        const shaped = residents.map(r => ({
            _id: r._id,
            residentId: r.residentId,
            name: `${r.firstName} ${r.lastName}`,
            firstName: r.firstName,
            lastName: r.lastName,
            age: r.age,
            gender: r.gender,
            room: r.roomNumber,
            floor: r.floor || '',
            bed: r.bed || '',
            conditions: (r.medicalConditions || []).map(c => c.name || c),
            alertLevel: r.alertLevel || 'stable',
            medicationOverdue: r.medicationOverdue || false,
            overdueMed: r.overdueMed || '',
            overdueAt: r.overdueAt || null,
            nextMed: r.nextMed || '',
            primaryNurse: r.assignedNurse || '',
            secondaryNurse: r.assignedCaregiver || '',
            status: r.status,
        }));
        res.json({ success: true, data: shaped, count: shaped.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/residents', async (req, res) => {
    try {
        const { firstName, lastName, middleName, age, gender, roomNumber, floor, bed, conditions, primaryNurse, alertLevel, admissionDate } = req.body;
        if (!firstName || !lastName || !age || !gender || !roomNumber)
            return res.status(400).json({ success: false, message: 'firstName, lastName, age, gender, roomNumber are required.' });

        const residentId = 'RES' + Date.now().toString().slice(-6);
        const resident = new Resident({
            residentId, firstName, lastName, age, gender,
            roomNumber, floor: floor || '', bed: bed || '',
            alertLevel: alertLevel || 'stable',
            admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
            medicalConditions: (conditions || []).map(c => ({ name: c })),
            assignedNurse: primaryNurse || `${req.user.firstName} ${req.user.lastName}`,
        });
        await resident.save();

        const shaped = {
            _id: resident._id,
            residentId: resident.residentId,
            name: `${resident.firstName} ${resident.lastName}`,
            firstName: resident.firstName,
            lastName: resident.lastName,
            age: resident.age,
            gender: resident.gender,
            room: resident.roomNumber,
            floor: resident.floor || '',
            bed: resident.bed || '',
            conditions: (resident.medicalConditions || []).map(c => c.name || c),
            alertLevel: resident.alertLevel || 'stable',
            medicationOverdue: resident.medicationOverdue || false,
            overdueMed: resident.overdueMed || '',
            overdueAt: resident.overdueAt || null,
            nextMed: resident.nextMed || '',
            primaryNurse: resident.assignedNurse || '',
            secondaryNurse: resident.assignedCaregiver || '',
            status: resident.status,
        };
        res.status(201).json({ success: true, data: shaped });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/residents/:id', async (req, res) => {
    try {
        const { conditions, ...rest } = req.body;
        const update = { ...rest };
        if (conditions) update.medicalConditions = conditions.map(c => ({ name: c }));
        const resident = await Resident.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
        res.json({ success: true, data: resident });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/residents/:id/vitals', async (req, res) => {
    try {
        const { bloodPressure, heartRate, temperature, oxygenSat, weight, notes } = req.body;

        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });

        const vitals = new VitalsLog({
            residentId: req.params.id,
            loggedBy: req.user._id,
            bloodPressure: bloodPressure || '',
            heartRate: heartRate ? +heartRate : null,
            temperature: temperature ? +temperature : null,
            oxygenSat: oxygenSat ? +oxygenSat : null,
            weight: weight ? +weight : null,
            notes: notes || '',
        });
        await vitals.save();

        let alertLevel = resident.alertLevel || 'stable';
        if ((+temperature > 38.5) || (+heartRate > 100) || (+oxygenSat < 94)) {
            alertLevel = 'alert';
        }
        if ((+temperature > 39.5) || (+heartRate > 120) || (+oxygenSat < 90)) {
            alertLevel = 'critical';
        }
        if (alertLevel !== resident.alertLevel) {
            await Resident.findByIdAndUpdate(req.params.id, { alertLevel });
        }

        res.status(201).json({ success: true, data: vitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/residents/:id/vitals', async (req, res) => {
    try {
        const vitals = await VitalsLog.find({ residentId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, data: vitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/medications', async (req, res) => {
    try {
        const meds = await Medication.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: meds });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/schedule', async (req, res) => {
    try {
        const { date, residentId } = req.query;
        const target = date ? new Date(date) : new Date();
        target.setHours(0, 0, 0, 0);
        const nextDay = new Date(target);
        nextDay.setDate(nextDay.getDate() + 1);

        const query = {
            caregiverId: req.user._id,
            scheduledTime: { $gte: target, $lt: nextDay },
        };
        if (residentId) query.residentId = residentId;

        let logs = await MedicationLog.find(query)
            .populate('residentId', 'firstName lastName roomNumber floor bed')
            .populate('medicationId', 'name dosage form purpose')
            .sort({ scheduledTime: 1 });

        logs = await autoMarkOverdue(logs);
        res.json({ success: true, data: logs.map(shapeLog), count: logs.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/schedule/all', async (req, res) => {
    try {
        const { date } = req.query;
        const target = date ? new Date(date) : new Date();
        target.setHours(0, 0, 0, 0);
        const nextDay = new Date(target);
        nextDay.setDate(nextDay.getDate() + 1);

        let logs = await MedicationLog.find({ scheduledTime: { $gte: target, $lt: nextDay } })
            .populate('residentId', 'firstName lastName roomNumber floor bed')
            .populate('medicationId', 'name dosage form purpose')
            .sort({ scheduledTime: 1 });

        logs = await autoMarkOverdue(logs);
        res.json({ success: true, data: logs.map(shapeLog), count: logs.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/schedule', async (req, res) => {
    try {
        const {
            residentId, medicationId, scheduledTime,
            dosage, frequency, nextDose, notes
        } = req.body;

        if (!residentId || !medicationId || !scheduledTime)
            return res.status(400).json({ success: false, message: 'residentId, medicationId, and scheduledTime are required.' });

        const [resident, medication] = await Promise.all([
            Resident.findById(residentId),
            Medication.findById(medicationId),
        ]);
        if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
        if (!medication) return res.status(404).json({ success: false, message: 'Medication not found.' });

        const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const log = new MedicationLog({
            logId,
            residentId: resident._id,
            medicationId: medication._id,
            caregiverId: req.user._id,
            residentName: `${resident.firstName} ${resident.lastName}`,
            medicationName: medication.name,
            room: resident.roomNumber || '',
            floor: resident.floor || '',
            bed: resident.bed || '',
            condition: medication.purpose || '',
            dosage: dosage || (medication.dosage ? `${medication.dosage.value}${medication.dosage.unit}` : ''),
            frequency: frequency || '',
            nextDose: nextDose || '',
            scheduledTime: new Date(scheduledTime),
            notes: notes || '',
            status: 'scheduled',
        });
        await log.save();

        res.status(201).json({ success: true, data: shapeLog(log) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/residents/:id/history', async (req, res) => {
    try {
        const logs = await MedicationLog.find({ 
            residentId: req.params.id,
            caregiverId: req.user._id
        })
        .sort({ scheduledTime: -1 })
        .limit(50);
        
        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/schedule/:id/status', async (req, res) => {
    try {
        const { status, notes, verificationMethod } = req.body;
        const allowed = ['scheduled', 'administered', 'overdue', 'missed', 'skipped', 'completed', 'pending'];
        if (!allowed.includes(status))
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });

        const log = await MedicationLog.findById(req.params.id);
        if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });

        log.status = status;
        if (status === 'administered' || status === 'completed') {
            log.administeredTime = new Date();
            await Inventory.findOneAndUpdate(
                { name: { $regex: new RegExp(log.medicationName, 'i') } },
                { $inc: { quantity: -1 } }
            );
            if (log.residentId) {
                const stillOverdue = await MedicationLog.findOne({
                    residentId: log.residentId,
                    status: 'overdue',
                    _id: { $ne: log._id }
                });
                if (!stillOverdue) {
                    await Resident.findByIdAndUpdate(log.residentId, {
                        medicationOverdue: false,
                        overdueMed: '',
                        overdueAt: null,
                    });
                }
            }
        }
        if (notes !== undefined) log.notes = notes;
        if (verificationMethod !== undefined) log.verificationMethod = verificationMethod;
        await log.save();

        res.json({ success: true, data: shapeLog(log), message: `Medication marked as ${status}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/schedule/:id', async (req, res) => {
    try {
        const { scheduledTime, dosage, notes, nextDose, frequency } = req.body;
        const update = {};
        if (scheduledTime !== undefined) update.scheduledTime = new Date(scheduledTime);
        if (dosage !== undefined) update.dosage = dosage;
        if (notes !== undefined) update.notes = notes;
        if (nextDose !== undefined) update.nextDose = nextDose;
        if (frequency !== undefined) update.frequency = frequency;

        const log = await MedicationLog.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('residentId', 'firstName lastName roomNumber floor bed')
            .populate('medicationId', 'name dosage form purpose');

        if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });
        res.json({ success: true, data: shapeLog(log) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const items = await Inventory.find({
            category: { $in: ['medication', 'medical_supplies'] }
        }).sort({ name: 1 });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/inventory/request', async (req, res) => {
    try {
        const { itemId, itemName, quantity, reason } = req.body;
        if (!itemName || !quantity)
            return res.status(400).json({ success: false, message: 'itemName and quantity are required.' });

        const request = new StockRequest({
            itemId: itemId || '',
            itemName: itemName.trim(),
            quantity: +quantity,
            reason: reason || '',
            requestedBy: req.user._id,
        });
        await request.save();

        res.json({
            success: true,
            message: `Stock request for ${quantity} units of "${itemName}" submitted.`,
            data: request
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/voice-note', async (req, res) => {
    try {
        const { note, logId } = req.body;
        if (!note) return res.status(400).json({ success: false, message: 'Note text is required.' });
        if (logId) await MedicationLog.findByIdAndUpdate(logId, { notes: note });
        res.json({ success: true, message: 'Voice note saved.', data: { note, savedAt: new Date(), savedBy: req.user._id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalResidents, todayLogs, invItems] = await Promise.all([
            Resident.countDocuments({ status: 'active' }),
            MedicationLog.find({ caregiverId: req.user._id, scheduledTime: { $gte: today, $lt: tomorrow } }),
            Inventory.find({ category: { $in: ['medication', 'medical_supplies'] } }, { quantity: 1, minThreshold: 1 }),
        ]);

        const total = todayLogs.length;
        const onTime = todayLogs.filter(l => l.status === 'administered' || l.status === 'completed').length;
        const delayed = todayLogs.filter(l => l.status === 'delayed').length;
        const missed = todayLogs.filter(l => l.status === 'missed').length;
        const pending = todayLogs.filter(l => l.status === 'scheduled' || l.status === 'pending').length;
        const overdue = todayLogs.filter(l => l.status === 'overdue').length;
        const complianceRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
        const lowMedStock = invItems.filter(i => i.quantity <= (i.minThreshold ?? 10)).length;

        res.json({ success: true, data: { totalResidents, total, onTime, delayed, missed, pending, overdue, complianceRate, lowMedStock } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;