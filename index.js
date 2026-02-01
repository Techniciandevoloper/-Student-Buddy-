const express = require('express');
const path = require('path');
const app = express();

// Ye line 'public' folder ki files ko server par load karti hai
app.use(express.static(path.join(__dirname, 'public')));

// Jab koi website kholega, toh use index.html milegi
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});