const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const tokenStore = require('../auth/tokenStore');

router.get('/discord', (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;

  res.redirect(redirect);
});

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code');

  try {
    // 1️⃣ Échange du code contre un token OAuth
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, expires_in } = tokenRes.data;

    // 2️⃣ Récupération de l’utilisateur Discord
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data;

    // 3️⃣ Sauvegarde du token Discord (APRÈS user)
    tokenStore.save(user.id, access_token, expires_in);

    // 4️⃣ Génération du JWT backend
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5️⃣ Réponse finale
res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Wolf Login</title>
</head>
<body>
  <script>
    window.location.href = "exp://192.168.1.21:8081?token=${jwtToken}";
  </script>
  Connexion en cours…
</body>
</html>
`);




  } catch (err) {
    console.error('❌ AUTH ERROR:', err.response?.data || err);
    res.status(500).json(err.response?.data || { error: 'auth_failed' });
  }
});

module.exports = router;

