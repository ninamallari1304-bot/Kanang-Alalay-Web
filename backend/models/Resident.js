const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
    residentId: {
        type:     String,
        required: true,
        unique:   true,
        uppercase: true
    },
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    middleName: { type: String, default: '',    trim: true },
    age:        { type: Number, required: true },
    gender:     { type: String, enum: ['male', 'female', 'other'], required: true },

    // ── Location ──────────────────────────────────────────────────────────────
    roomNumber: { type: String, required: true },
    floor:      { type: String, default: '' },   // e.g. '2nd Floor'
    bed:        { type: String, default: '' },   // e.g. 'Bed 1'

    // ── Medical ───────────────────────────────────────────────────────────────
    medicalConditions: [{
        name:     String,
        severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' }
    }],

    // ── Alert / Status ────────────────────────────────────────────────────────
    alertLevel: {
        type:    String,
        enum:    ['stable', 'alert', 'critical'],
        default: 'stable'
    },

    // ── Medication overdue tracking ───────────────────────────────────────────
    medicationOverdue: { type: Boolean, default: false },
    overdueMed:        { type: String,  default: '' },
    overdueAt:         { type: Date,    default: null },
    nextMed:           { type: String,  default: '' },

    // ── Assignment ────────────────────────────────────────────────────────────
    assignedNurse:     { type: String, default: '' },
    assignedCaregiver: { type: String, default: '' },

    // ── Admission ─────────────────────────────────────────────────────────────
    admissionDate: { type: Date, default: Date.now },
    status: {
        type:    String,
        enum:    ['active', 'discharged', 'transferred', 'deceased'],
        default: 'active'
    },

}, { timestamps: true });

residentSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Resident', residentSchema);