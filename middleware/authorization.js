const db = require('../db/db');

exports.authorize = (permissionId = 0) => (req, res, next) => {
  db.findUserIdBySessionId(req.sessionID).then((userId) => {
    if (userId) {
      if (permissionId) {
        db.checkUserPermission(userId, permissionId).then((result) => {
          if (result) {
            req.session.userId = userId;
            next();
          } else {
            res.status(401).json({ succeed: false, authenticated: true, message: 'Access denied.' });
          }
        });
      } else {
        req.session.userId = userId;
        next();
      }
    } else {
      res.status(401).json({ succeed: false, authenticated: false, message: 'Invalid session ID.' });
    }
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
};
