// services/users-service/backend/src/app.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock user endpoints for testing
app.post('/api', (req, res) => {
  const { email, password, name } = req.body;
  res.status(201).json({
    id: 1,
    email,
    name
  });
});

app.get('/api/profile', (req, res) => {
  res.json({
    id: 1,
    email: 'test@example.com',
    name: 'Test User'
  });
});

app.put('/api/profile', (req, res) => {
  const { name } = req.body;
  res.json({
    id: 1,
    email: 'test@example.com',
    name
  });
});

// Start server if not imported as a module
if (require.main === module) {
  const port = process.env.PORT || 3200;
  app.listen(port, () => {
    console.log(`Users service listening on port ${port}`);
  });
}

module.exports = app; 