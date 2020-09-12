const express = require('express'),
  db = require('../../../../db/db'),
  rest = require('../../../../utils/rest'),
  responses = require('../../../../utils/responses'),
  gameUtils = require('../../gameUtils'),
  utils = require('../../../../utils/utils');

const router = express.Router({ mergeParams: true });

const isValidScoreData = ({ teamId, score, fairplay }) => typeof teamId === 'number' && typeof score === 'number'
  && typeof fairplay === 'boolean' && utils.checkId(teamId) && utils.checkIntGE0(score);

router.get('/', (req, res) => {
  const gameId = req.params.id;
  gameUtils.getGamePermissions(gameId, req, res).then((game) => {
    if (game.permissions.includes('base')) {
      rest.restGetCall(() => db.findScoresByGameId(gameId), req, res);
    }
  });
});

router.put('/', (req, res) => {
  const data = JSON.parse(req.body);
  const gameId = req.params.id;

  if (!isValidScoreData(data)) {
    responses.badRequest(res);
  } else {
    gameUtils.getGamePermissions(gameId, req, res).then((game) => {
      if (game.permissions.includes('base')) {
        db.insertScore(gameId, data).then(() => {
          responses.succeed(res);
        }).catch((error) => {
          console.log(error.message);
          responses.internalServerError(res);
        });
      }
    });
  }
});

router.post('/', (req, res) => {
  const data = JSON.parse(req.body);
  const gameId = req.params.id;

  if (!isValidScoreData(data)) {
    responses.badRequest(res);
  } else {
    gameUtils.getGamePermissions(gameId, req, res).then((game) => {
      if (game.permissions.includes('base')) {
        db.updateScore(gameId, data).then(() => {
          responses.succeed(res);
        }).catch((error) => {
          console.log(error.message);
          responses.internalServerError(res);
        });
      }
    });
  }
});

module.exports = router;
