const express = require('express');
const path = require('path');
const app = express();

// Middleware to serve static files from "public"
// Serve `index.html` as the default index so visitors land on the home page
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

// Example API route (optional)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});