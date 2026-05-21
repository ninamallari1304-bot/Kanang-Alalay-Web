const mongoose = require('mongoose');

const BP_PATTERN = /^\d{2,3}\/\d{2,3}$/;

const vitalsLogSchema = new mongoose.Schema({
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodPressure: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator(value) {
                if (!value) return true;
                if (!BP_PATTERN.test(value)) return false;
                const [systolic, diastolic] = value.split('/').map(Number);
                return systolic >= 60 && systolic <= 250 && diastolic >= 30 && diastolic <= 150 && systolic > diastolic;
            },
            message: 'Blood pressure must be in format 120/80 with systolic 60-250 and diastolic 30-150.'
        }
    },
    heartRate: { type: Number, min: 20, max: 300, default: null },
    temperature: { type: Number, min: 30, max: 45, default: null },
    oxygenSat: { type: Number, min: 50, max: 100, default: null },
    weight: { type: Number, min: 1, max: 300, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

vitalsLogSchema.index({ residentId: 1, createdAt: -1 });

module.exports = mongoose.model('VitalsLog', vitalsLogSchema);