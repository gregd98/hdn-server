const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  { PERM_TEAMS_DATA_ACCESS } = require('../constants'),
  responses = require('../utils/responses');

const router = express.Router();

router.use(auth.authorize(PERM_TEAMS_DATA_ACCESS));

router.get('/', (req, res) => {
  rest.restGetCall(() => db.findAllPlayers(req.session.eventId), req, res);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.findPlayerById(id, req.session.eventId).then((player) => {
    if (player) {
      responses.rest(res, player);
    } else {
      responses.notFound(res);
    }
  }).catch((error) => {
    console.log(error.message);
    responses.internalServerError(res);
  });
});

module.exports = router;
