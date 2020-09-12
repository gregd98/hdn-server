const db = require('../../db/db'),
  {
    PERM_ADD_GAME, PERM_ALL_GAME_ACCESS, PERM_ALL_GAME_ADMIN, PERM_EDIT_ASSIGNED_GAME,
  } = require('../../constants'),
  responses = require('../../utils/responses');

exports.getGamePermissions = (gameId, req, res) => new Promise((resolve) => {
  let permissions = [];
  let game = {};
  db.findPermissionsByUserId(req.session.userId).then((mPermissions) => {
    permissions = mPermissions;
  }).then(() => db.findGameById(gameId, req.session.eventId)).then((mGame) => {
    if (mGame.length > 0) {
      [game] = mGame;
      db.findAssignmentsByGameId(gameId).then((assignments) => {
        game.assignments = assignments;
        if (game.ownerId === req.session.userId || permissions.includes(PERM_ALL_GAME_ADMIN)) {
          game.permissions = ['base', 'edit', 'admin'];
          resolve(game);
        } else if (assignments.map((user) => user.id).includes(req.session.userId)) {
          if (permissions.includes(PERM_EDIT_ASSIGNED_GAME)) {
            game.permissions = ['base', 'edit'];
          } else {
            game.permissions = ['base'];
          }
          resolve(game);
        } else if (permissions.includes(PERM_ALL_GAME_ACCESS)) {
          game.permissions = ['base'];
          resolve(game);
        } else {
          responses.accessDenied(res);
        }
      }).catch((error) => {
        console.log(error.message);
        responses.internalServerError(res);
      });
    } else {
      responses.notFound(res);
    }
  })
    .catch((error) => {
      console.log(error.message);
      responses.internalServerError(res);
    });
});

exports.insertAssignments = (gameId, list, conn) => new Promise((resolve, reject) => {
  let p = Promise.resolve();
  if (list.length === 0) {
    resolve();
  } else {
    for (let i = 0; i < list.length; i += 1) {
      p = p.then(() => new Promise((resolve2) => db.insertAssignment(gameId, list[i], conn)
        .then(() => {
          (i === list.length - 1 ? resolve : resolve2)();
        }).catch((error) => {
          reject(error);
        })));
    }
  }
});
