require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Test route to verify basic functionality
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Basic server is working!' });
});

// GitHub auth route (simplified for testing)
app.get('/auth/github', (req, res) => {
  console.log('GitHub auth route hit!');
  res.json({ message: 'GitHub auth route is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});