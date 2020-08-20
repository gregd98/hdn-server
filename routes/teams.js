const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  { PERM_TEAMS_DATA_ACCESS } = require('../constants');

const router = express.Router();

router.use(auth.authorize(PERM_TEAMS_DATA_ACCESS));

router.get('/', (req, res) => {
  rest.restGetCall(() => db.findAllTeams(req.session.eventId), req, res);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.findTeamById(id, req.session.eventId).then((team) => {
    if (team) {
      const payload = { team };
      db.findPlayersByTeamId(id).then((players) => {
        payload.players = players;
        res.status(200).json({ succeed: true, payload });
      }).catch((error) => {
        console.log(error.message);
        res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
      });
    } else {
      console.log(`404: /teams/${id}`);
      res.status(404).json({ succeed: false, authenticated: true, message: 'This page does not exist.' });
    }
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

module.exports = router;
