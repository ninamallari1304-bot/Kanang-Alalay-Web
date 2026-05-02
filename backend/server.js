require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const Donation = require('./models/Donation');
const Booking = require('./models/Booking');
const Inventory = require('./models/Inventory');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const alertRoutes = require('./routes/alertRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const donationRoutes = require('./routes/donationRoutes');
const paymentRoutes = require('./routes/PaymentRoutes');
const headCaregiverRoutes = require('./routes/headCaregiverRoutes');
const residentRoutes = require('./routes/residentRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://kanang-alalay.vercel.app',
    'https://lsae-kanangalalay.online',
    'http://localhost:3000'
].filter(Boolean);

const isLocalDevOrigin = (origin = '') =>
    /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isLocalDevOrigin(origin)) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
}).then(async () => {
    console.log('MongoDB Atlas connected successfully!');
    try {
        // Seed default users
        const defaultUsers = [
            {
                staffId: 'LSAE-ADMIN-0001',
                username: 'admin',
                email: 'admin@kanangalalay.org',
                password: await bcrypt.hash('admin123', 10),
                firstName: 'Master',
                lastName: 'Admin',
                role: 'admin',
                isActive: true,
                isVerified: true,
                shift: 'morning',
                department: 'Head Office'
            },
            {
                staffId: 'LSAE-HC-0001',
                username: 'headcaregiver',
                email: 'headcaregiver@kanangalalay.org',
                password: await bcrypt.hash('headcaregiver123', 10),
                firstName: 'Head',
                lastName: 'Caregiver',
                role: 'head_caregiver',
                isActive: true,
                isVerified: true,
                shift: 'morning',
                department: 'Care Management'
            },
            {
                staffId: 'LSAE-CG-0001',
                username: 'caregiver',
                email: 'caregiver@kanangalalay.org',
                password: await bcrypt.hash('caregiver123', 10),
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
                    existing.password = userData.password; // Already hashed
                }
                await existing.save();
                continue;
            }

            const user = new User(userData);
            await user.save();
        }
        console.log('✅ Default backend users ensured.');
    } catch (seedError) {
        console.error('Failed to seed default users:', seedError);
    }
}).catch((err) => {
    console.error(`Connection failed: ${err.message}`);
    process.exit(1);
});

app.get('/', (req, res) => {
    res.json({
        message: 'Kanang-Alalay Backend API is running!',
        status: 'active',
        version: '2.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            bookings: '/api/bookings',
            donations: '/api/donations',
            payments: '/api/payments',
            alerts: '/api/alerts',
            admin: '/api/admin',
            stats: '/api/stats',
            inventory: '/api/inventory',
            headCaregiver: '/api/head-caregiver',
            residents: '/api/residents',
            medications: '/api/medications'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/head-caregiver', headCaregiverRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/medications', medicationRoutes);

app.get('/api/stats', async (req, res) => {
    try {
        const [totalDonations, pendingBookings, donationAgg, inventoryItems] = await Promise.all([
            Donation.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Donation.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Inventory.find({}, { quantity: 1, minThreshold: 1 })
        ]);

        const lowStockItems = inventoryItems.filter(
            i => i.quantity <= (i.minThreshold ?? 10)
        ).length;

        res.json({
            success: true,
            data: {
                totalResidents: 71,
                pendingBookings,
                totalDonations,
                totalDonationAmount: donationAgg[0]?.total || 0,
                lowStockItems
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

app.get('/api/inventory', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const items = await Inventory.find().limit(limit).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching inventory' });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const item = new Inventory({
            ...req.body,
            itemId: `INV-${Date.now().toString().slice(-6)}`
        });
        await item.save();
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding inventory item' });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating inventory item' });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting inventory item' });
    }
});

app.post('/api/email/send-booking-status', async (req, res) => {
    try {
        const { to, status, bookingDetails, reason } = req.body;
        const { sendEmail, generateBookingConfirmationTemplate, generateBookingRejectionTemplate } = require('./models/mailer');

        if (status === 'approved') {
            await sendEmail(to, 'Booking Confirmed - Kanang Alalay',
                generateBookingConfirmationTemplate({ ...bookingDetails, email: to }));
        } else if (status === 'rejected') {
            await sendEmail(to, 'Booking Update - Kanang Alalay',
                generateBookingRejectionTemplate({ ...bookingDetails, email: to }, reason));
        }

        res.json({ success: true, message: 'Email sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.use((req, res) =>
    res.status(404).json({ success: false, message: 'Endpoint not found' })
);
app.use((err, req, res, next) =>
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});