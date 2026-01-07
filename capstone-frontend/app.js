const express = require('express');
const path = require('path');
const app = express();

// Middleware to serve static files from "public"
// Serve `login.html` as the default index so visitors land on the login/register page
app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

// Example API route (optional)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});