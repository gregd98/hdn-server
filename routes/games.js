const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  {
    PERM_ADD_GAME, PERM_ALL_GAME_ACCESS, PERM_ALL_GAME_ADMIN, PERM_EDIT_ASSIGNED_GAME,
  } = require('../constants');

const router = express.Router();

const mySleep = () => {
  for (let i = 1; i < 500000; i += 1) {
    console.log(Math.sqrt(i));
  }
};

router.get('/', auth.authorize(), (req, res) => {
  const { own } = req.query;
  db.checkUserPermission(req.session.userId, PERM_ALL_GAME_ACCESS).then((result) => {
    if (result) {
      if (own) {
        rest.restGetCall(() => db.findGamesByOwnerId(
          req.session.userId, req.session.eventId,
        ), req, res);
      } else {
        rest.restGetCall(() => db.findAllGames(req.session.eventId), req, res);
      }
    } else {
      rest.restGetCall(() => db.findGamesByOwnerId(
        req.session.userId, req.session.eventId,
      ), req, res);
    }
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

router.put('/', auth.authorize(PERM_ADD_GAME), (req, res) => {
  // TODO itt nincs validalva a semmi se
  const data = JSON.parse(req.body);
  db.insertGame(data, req.session.userId, req.session.eventId).then(() => {
    res.status(200).json({ succeed: true });
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

const getGamePermissions = (gameId, req, res) => new Promise((resolve) => {
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
          res.status(401).json({ succeed: false, authenticated: true, message: 'Access denied.' });
        }
      }).catch((error) => {
        console.log(error.message);
        res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
      });
    } else {
      res.status(404).json({ succeed: false, authenticated: true, message: 'Not found.' });
    }
  })
    .catch((error) => {
      console.log(error.message);
      res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
    });
});

const insertAssignments = (gameId, list, conn) => new Promise((resolve, reject) => {
  let p = Promise.resolve();
  if (list.length === 0) {
    resolve();
  } else {
    for (let i = 0; i < list.length; i += 1) {
      p = p.then(() => new Promise((resolve2) => db.insertAssignment(gameId, list[i], conn)
        .then(() => {
          if (i === list.length - 1) {
            resolve();
          } else {
            resolve2();
          }
        }).catch((error) => {
          reject(error);
        })));
    }
  }
});

router.get('/:id', auth.authorize(), (req, res) => {
  getGamePermissions(req.params.id, req, res).then((game) => {
    res.status(200).json({ succeed: true, payload: game });
  });
});

router.post('/:id/assignments', auth.authorize(), (req, res) => {
  // TODO validation neeed
  const gameId = req.params.id;
  const data = JSON.parse(req.body);
  getGamePermissions(gameId, req, res).then((game) => {
    if (game.permissions.includes('admin')) {
      let conn;
      db.getConnection().then((mConn) => {
        conn = mConn;
      }).then(() => db.beginTransaction(conn))
        .then(() => db.deleteAssignmentsByGameId(gameId, conn))
        .then(() => insertAssignments(gameId, data, conn))
        .then(() => db.commit(conn))
        .then(() => {
          conn.release();
          res.status(200).json({ succeed: true });
        })
        .catch((error) => {
          console.log(error.message);
          db.rollback(conn).then(() => {
            conn.release();
          }).catch((e) => {
            conn.release();
            console.log(e.message);
          });
          res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
        });
    } else {
      res.status(401).json({ succeed: false, authenticated: true, message: 'Access denied.' });
    }
  });
});

router.post('/:id/moveOwner', auth.authorize(), (req, res) => {
  const gameId = req.params.id;
  const data = JSON.parse(req.body);
  getGamePermissions(gameId, req, res).then((game) => {
    if (game.permissions.includes('admin')) {
      db.updateGameOwner(gameId, data).then(() => {
        res.status(200).json({ succeed: true });
      }).catch((error) => {
        console.log(error.message);
        res.status(500).json({ succeed: false, authenticated: false, message: 'Internal server error.' });
      });
    }
  });
});

module.exports = router;
