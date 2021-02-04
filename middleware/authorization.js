const db = require('../db/db');

exports.authorize = (permissionId = 0) => (req, res, next) => {
  db.findUserIdBySessionId(req.sessionID).then((userData) => {
    if (userData) {
      const { userId, eventId } = userData;
      if (permissionId) {
        db.checkUserPermission(userId, permissionId).then((result) => {
          if (result) {
            req.session.userId = userId;
            req.session.eventId = eventId;
            next();
          } else {
            res.status(401).json({ succeed: false, authenticated: true, message: 'Access denied.' });
          }
        });
      } else {
        req.session.userId = userId;
        req.session.eventId = eventId;
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

exports.sleep = (ms) => (req, res, next) => new Promise(() => setTimeout(next, ms));
