const express = require('express');
const router = express.Router();
const authJWT = require('../middlewares/authJWT');


router.get('/', authJWT, async (req, res) => {
  try {
    const userToken = req.user.accessToken;

    // 1️⃣ Guilds utilisateur
    const userGuildsRes = await fetch(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    const userGuilds = await userGuildsRes.json();

    // 2️⃣ Guilds bot
    const botGuildsRes = await fetch(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
      }
    );

    const botGuilds = await botGuildsRes.json();
    const botGuildIds = botGuilds.map(g => g.id);

    // 3️⃣ Filtrage admin + statut bot
    const managedGuilds = userGuilds
      .filter(g => (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20)) // ADMIN
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null,
        botInstalled: botGuildIds.includes(g.id)
      }));

    res.json(managedGuilds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load managed guilds' });
  }
});

module.exports = router;
