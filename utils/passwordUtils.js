const crypto = require('crypto');

exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(64).toString('base64');
  const iterations = 10000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return { salt, hash, iterations };
};

exports.checkPassword = (fromDb, password) => fromDb.hash === crypto.pbkdf2Sync(password, fromDb.salt, fromDb.iterations, 64, 'sha512').toString('hex');
