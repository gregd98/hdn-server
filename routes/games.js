const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  { PERM_ADD_GAME } = require('../constants');

const router = express.Router();

router.get('/', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllGames(req.session.eventId), req, res);
});

router.put('/', auth.authorize(PERM_ADD_GAME), (req, res) => {
  const data = JSON.parse(req.body);
  console.log(data);
  db.insertGame(data, req.session.userId, req.session.eventId).then(() => {
    res.status(200).json({ succeed: true });
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

module.exports = router;
