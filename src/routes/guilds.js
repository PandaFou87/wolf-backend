const express = require('express');
const router = express.Router();
const axios = require('axios');
const authJWT = require('../middlewares/authJWT');
const tokenStore = require('../auth/tokenStore');

// ADMIN = 0x8
function isAdmin(permissions) {
  return (BigInt(permissions) & 0x8n) === 0x8n;
}

// Récupérer les guilds du bot
async function getBotGuildIds() {
  const res = await axios.get(
    'https://discord.com/api/users/@me/guilds',
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );
  return new Set(res.data.map(g => g.id));
}

router.get('/', authJWT, async (req, res) => {
  try {
    const accessToken = tokenStore.get(req.user.id);
    if (!accessToken) {
      return res.status(401).json({ error: 'Discord token expired. Re-login required.' });
    }

    // Guilds de l’utilisateur
    const userGuildsRes = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Guilds du bot
    const botGuildIds = await getBotGuildIds();

    const result = userGuildsRes.data
      .filter(g => isAdmin(g.permissions) && botGuildIds.has(g.id))
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null,
        owner: g.owner
      }));

    res.json(result);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch managed guilds' });
  }
});

module.exports = router;

