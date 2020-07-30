const express = require('express'),
  cors = require('cors'),
  db = require('../db/db'),
  passwordUtils = require('../utils/passwordUtils');

const router = express.Router();

router.use(express.text());

const reactDevCors = {
  origin: 'http://localhost:3000',
  credentials: true,
};

router.get('/', cors(reactDevCors), (req, res) => {
  console.log(req.sessionID);
  res.status(200).json({ a: 'anyad', b: 'picsaja' });
});

router.post('/', cors(reactDevCors), (req, res) => {
  console.log(req.sessionID);
  console.log(JSON.parse(req.body).message);
  res.status(200).json({ a: 'anyad', b: 'post picsaja' });
});

router.post('/login', cors(reactDevCors), (req, res) => {
  const data = JSON.parse(req.body);
  console.log(`Username: ${data.username}\nPassword: ${data.password}`);
  db.findLoginDataByUsername(data.username).then((result) => {
    let succeed;
    if (result) {
      succeed = passwordUtils.checkPassword(result, data.password);
    } else {
      succeed = false;
    }
    res.status(200).json({ succeed });
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false });
  });
});

module.exports = router;