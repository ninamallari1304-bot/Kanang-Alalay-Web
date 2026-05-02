const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    medicationId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        default: function () {
            return this.name ? this.name.replace(/\s+/g, '_').toUpperCase() : undefined;
        }
    },
    uniqueCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        default: function () {
            return this.name ? this.name.replace(/\s+/g, '_').toUpperCase() : undefined;
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    genericName: String,
    dosage: {
        value: Number,
        unit: String
    },
    form: {
        type: String,
        enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment']
    },
    purpose: String,
    stock: {
        current: {
            type: Number,
            default: 0
        },
        minimum: {
            type: Number,
            default: 10
        },
        maximum: {
            type: Number,
            default: 100
        },
        unit: String
    },
    expiryDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);