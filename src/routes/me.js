const express = require('express');
const router = express.Router();
const authJWT = require('../middlewares/authJWT');

router.get('/', authJWT, (req, res) => {
  const user = req.user;

  let avatarUrl = null;

  if (user.avatar) {
    const isAnimated = user.avatar.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';

    avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}`;
  }

  res.json({
    id: user.id,
    username: user.global_name || user.username,
    avatar: avatarUrl
  });
});

module.exports = router;
