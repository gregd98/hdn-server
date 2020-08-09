const crypto = require('crypto');

exports.calculatePasswordStrength = (value) => {
  let strength = 0;
  if (value.match(/[\p{Ll}]+/u)) {
    strength += 1;
  }
  if (value.match(/\p{Lu}/u)) {
    strength += 1;
  }
  if (value.match(/[0-9]/)) {
    strength += 1;
  }
  if (value.match(/[`~!@#$%^&*()\-_=+{}[\]\\|;:'",<.>/?]+/)) {
    strength += 1;
  }
  return strength;
};

exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(64).toString('base64');
  const iterations = 10000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return { salt, hash, iterations };
};

exports.checkPassword = (fromDb, password) => fromDb.hash === crypto.pbkdf2Sync(password, fromDb.salt, fromDb.iterations, 64, 'sha512').toString('hex');
