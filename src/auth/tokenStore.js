// Store mémoire (DEV)
const store = new Map();

/**
 * save(userId, accessToken, expiresIn)
 */
function save(userId, accessToken, expiresIn) {
  const expiresAt = Date.now() + (expiresIn * 1000);
  store.set(userId, { accessToken, expiresAt });
}

/**
 * get(userId) -> accessToken | null
 */
function get(userId) {
  const data = store.get(userId);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    store.delete(userId);
    return null;
  }
  return data.accessToken;
}

module.exports = { save, get };
