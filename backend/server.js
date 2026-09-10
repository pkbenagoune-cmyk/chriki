require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
const invitationRoutes = require('./routes/invitationRoutes');
app.use('/api', invitationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chriki backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur Chriki démarré sur le port ${PORT}`);
});