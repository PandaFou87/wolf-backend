const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * 🔐 Step 1 — Redirect vers Discord
 */
router.get('/discord', (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?` +
    `client_id=${process.env.DISCORD_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=identify guilds`;

  res.redirect(redirect);
});

/**
 * 🔁 Step 2 — Callback Discord
 */
router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code');

  try {
    // 1️⃣ Exchange code → OAuth token
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;

    // 2️⃣ Get Discord user
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data;

    // 3️⃣ Create JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4️⃣ Redirect vers l’app mobile (DEEP LINK)
   res.redirect(
  `http://localhost:3000/auth/callback?token=${encodeURIComponent(jwtToken)}`
);



  } catch (err) {
    console.error('❌ AUTH ERROR:', err.response?.data || err);
    res.status(500).json({ error: 'auth_failed' });
  }
});

module.exports = router;


