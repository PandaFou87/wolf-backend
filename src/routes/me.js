const express = require('express');
const router = express.Router();
const authJWT = require('../middlewares/authJWT');

router.get('/', authJWT, (req, res) => {
  const user = req.user;

  let avatarUrl = null;

  if (user.avatar) {
    // 🔥 FORCER PNG STATIQUE (même si avatar animé)
    avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }

  res.json({
    id: user.id,
    username: user.global_name || user.username,
    avatar: avatarUrl
  });
});

module.exports = router;

