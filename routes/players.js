const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest');

const router = express.Router();

router.use(auth.authorize(1));

router.get('/', (req, res) => {
  rest.restGetCall(db.findAllPlayers, req, res);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.findPlayerById(id).then((player) => {
    if (player) {
      res.status(200).json({ succeed: true, payload: player });
    } else {
      console.log(`404: /players/${id}`);
      res.status(404).json({ succeed: false, authenticated: true, message: 'This page does not exist.' });
    }
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

module.exports = router;
