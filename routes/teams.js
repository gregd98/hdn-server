const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  { PERM_TEAMS_DATA_ACCESS } = require('../constants'),
  responses = require('../utils/responses');

const router = express.Router();

router.get('/', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllTeams(req.session.eventId), req, res);
});

router.get('/:id', auth.authorize(PERM_TEAMS_DATA_ACCESS), (req, res) => {
  const { id } = req.params;
  db.findTeamById(id, req.session.eventId).then((team) => {
    if (team) {
      const payload = { team };
      db.findPlayersByTeamId(id).then((players) => {
        payload.players = players;
        responses.rest(res, payload);
      }).catch((error) => {
        console.log(error.message);
        responses.internalServerError(res);
      });
    } else {
      responses.notFound(res);
    }
  }).catch((error) => {
    console.log(error.message);
    responses.internalServerError(res);
  });
});

module.exports = router;
