const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const escalationRoutes = require('./routes/escalationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'Smart Task Escalation Engine', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Smart Task Escalation API running on port ${config.port}`);
  });
}

module.exports = app;
