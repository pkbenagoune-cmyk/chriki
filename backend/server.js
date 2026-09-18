// ============================================================
// CHRIKI - SERVER
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const activityRoutes = require('./routes/activityRoutes');

// ============================================================
// APPLICATION
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARES
// ============================================================

// Autoriser le frontend React à communiquer avec le backend
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
    origin: CORS_ORIGIN
}));

app.use(express.json());

// ============================================================
// ROUTES API
// ============================================================

app.use('/api/auth', authRoutes);

app.use('/api/groups', groupRoutes);

app.use('/api/groups', expenseRoutes);

app.use('/api/groups', categoryRoutes);

app.use('/api', invitationRoutes);

app.use('/api/groups', activityRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Chriki backend is running'
    });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Serveur Chriki démarré sur le port ${PORT}`);
});