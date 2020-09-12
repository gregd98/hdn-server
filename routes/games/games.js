const express = require('express'),
  validate = require('validate.js'),
  db = require('../../db/db'),
  auth = require('../../middleware/authorization'),
  rest = require('../../utils/rest'),
  { PERM_ADD_GAME, PERM_ALL_GAME_ACCESS } = require('../../constants'),
  gameConstraints = require('../../utils/constraints/gameConstraints'),
  responses = require('../../utils/responses'),
  gameRoute = require('./game/game');

const router = express.Router();

router.get('/', auth.authorize(), (req, res) => {
  const { own } = req.query;
  db.checkUserPermission(req.session.userId, PERM_ALL_GAME_ACCESS).then((result) => {
    const { userId, eventId } = req.session;
    if (result) {
      if (own) {
        rest.restGetCall(() => db.findGamesByOwnerId(userId, eventId), req, res);
      } else {
        rest.restGetCall(() => db.findAllGames2(eventId), req, res);
      }
    } else {
      rest.restGetCall(() => db.findGamesByOwnerId(userId, eventId), req, res);
    }
  }).catch((error) => {
    console.log(error.message);
    responses.internalServerError(res);
  });
});

router.put('/', auth.authorize(PERM_ADD_GAME), (req, res) => {
  // TODO itt majd a timeokat checkolni
  const data = JSON.parse(req.body);
  console.log(data);
  const validation = validate(data, gameConstraints, { fullMessages: false });
  if (validation) {
    Object.entries(validation).forEach(([key, value]) => { [validation[key]] = value; });
    console.log(validation);
    responses.inputErrors(res, validation);
  } else {
    db.checkExistence('name', 'Games', data.title, true, {
      title: 'Name of game must be unique.',
    }, req.session.eventId).then(() => {
      db.insertGame(data, req.session.userId, req.session.eventId).then(() => {
        responses.succeed(res);
      }).catch((error) => {
        console.log(error.message);
        responses.internalServerError(res);
      });
    }).catch((error) => {
      if (error instanceof Error) {
        console.log(error.message);
        responses.internalServerError(res);
      } else {
        console.log(error);
        responses.inputErrors(res, error);
      }
    });
  }
});

router.use('/:id', gameRoute);

module.exports = router;
