const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// serve static files from the "dist" directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Handle SPA fallback (for React router, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});