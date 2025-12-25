const express = require('express');
const router = express.Router();
const authJWT = require('../middlewares/authJWT');

router.get('/', authJWT, async (req, res) => {
  const { user } = req; // injecté par authJWT

  res.json({
    id: user.id,
    username: user.global_name || user.username,
    avatar: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : null
  });
});

module.exports = router;
