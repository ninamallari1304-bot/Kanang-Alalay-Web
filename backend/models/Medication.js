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
    barcode: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        sparse: true
    },
    genericName: String,
    dosage: {
        value: Number,
        unit: String
    },
    strength: String,
    form: String,
    route: String,
    manufacturer: String,
    ndc: String,
    purpose: String,
    instructions: String,
    warnings: String,
    sideEffects: String,
    contraindications: String,
    drugInteractions: String,
    pregnancy: String,
    storage: String,
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