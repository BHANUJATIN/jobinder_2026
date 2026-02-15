const crypto = require('crypto');

function generateJobHash(title, company, location) {
  const str = `${(title || '').toLowerCase().trim()}|${(company || '').toLowerCase().trim()}|${(location || '').toLowerCase().trim()}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateJobHash, generateToken };
