const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretfinancetrackerjwtkey2026', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
