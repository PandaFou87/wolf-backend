require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route test

app.get('/', (req, res) => {
  res.send('🐺 Wolf backend is running');
});

// Routes auth
app.use('/auth', require('./routes/auth'));
app.use('/guilds', require('./routes/guilds'));
app.use('/me', require('./routes/me'));


// Port
const PORT = process.env.PORT || 3000;

// Lancement serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
