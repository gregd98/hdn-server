const express = require('express'),
  validate = require('validate.js'),
  paramCheck = require('../../../middleware/paramChecker'),
  auth = require('../../../middleware/authorization'),
  gameUtils = require('../gameUtils'),
  gameConstraints = require('../../../utils/constraints/gameConstraints'),
  db = require('../../../db/db'),
  responses = require('../../../utils/responses'),
  utils = require('../../../utils/utils'),
  scoreRoute = require('./scores/scores');

const router = express.Router({ mergeParams: true });
const { checkId } = paramCheck;

router.use(checkId());
router.use(auth.authorize());

router.post('/', (req, res) => {
  // TODO itt majd a timeokat checkolni
  const data = JSON.parse(req.body);
  const gameId = req.params.id;
  gameUtils.getGamePermissions(gameId, req, res).then((game) => {
    if (game.permissions.includes('edit')) {
      const validation = validate(data, gameConstraints, { fullMessages: false });
      if (validation) {
        Object.entries(validation).forEach(([key, value]) => { [validation[key]] = value; });
        responses.inputErrors(res, validation);
      } else {
        db.checkExistence('name', 'Games', data.title, true, {
          title: 'Title of game must be unique.',
        }, req.session.eventId, gameId).then(() => {
          db.updateGame(data, req.params.id).then(() => {
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
    } else {
      responses.accessDenied(res);
    }
  });
});

router.get('/', (req, res) => {
  gameUtils.getGamePermissions(req.params.id, req, res).then((game) => {
    responses.rest(res, game);
  });
});

router.delete('/', (req, res) => {
  const gameId = req.params.id;
  gameUtils.getGamePermissions(gameId, req, res).then((game) => {
    if (game.permissions.includes('admin')) {
      db.deleteGame(gameId).then(() => {
        responses.succeed(res);
      }).catch((error) => {
        console.log(error.message);
        responses.internalServerError(res);
      });
    } else {
      responses.accessDenied(res);
    }
  });
});

router.post('/assignments', (req, res) => {
  const gameId = req.params.id;
  const data = JSON.parse(req.body);
  gameUtils.getGamePermissions(gameId, req, res).then((game) => {
    if (!Array.isArray(data) || data.includes(game.ownerId) || !utils.checkIdList(data)) {
      responses.badRequest(res);
    } else if (game.permissions.includes('admin')) {
      let conn;
      db.getConnection().then((mConn) => {
        conn = mConn;
      }).then(() => db.beginTransaction(conn))
        .then(() => db.deleteAssignmentsByGameId(gameId, conn))
        .then(() => gameUtils.insertAssignments(gameId, data, conn))
        .then(() => db.commit(conn))
        .then(() => {
          conn.release();
          responses.succeed(res);
        })
        .catch((error) => {
          console.log(error.message);
          db.rollback(conn).then(() => {
            conn.release();
          }).catch((e) => {
            conn.release();
            console.log(e.message);
          });
          responses.internalServerError(res);
        });
    } else {
      responses.accessDenied(res);
    }
  });
});

router.post('/moveOwner', (req, res) => {
  const gameId = req.params.id;
  const data = JSON.parse(req.body);
  if (!utils.checkId(data)) {
    responses.badRequest(res);
  } else {
    gameUtils.getGamePermissions(gameId, req, res).then((game) => {
      if (Number(data) === game.ownerId) {
        responses.badRequest(res);
      } else if (game.permissions.includes('admin')) {
        db.updateGameOwner(gameId, data).then(() => {
          responses.succeed(res);
        }).catch((error) => {
          console.log(error.message);
          responses.internalServerError(res);
        });
      } else {
        responses.accessDenied(res);
      }
    });
  }
});

router.use('/scores', scoreRoute);

module.exports = router;
