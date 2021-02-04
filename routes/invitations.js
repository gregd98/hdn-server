const express = require('express'),
  validate = require('validate.js'),
  crypto = require('crypto'),
  auth = require('../middleware/authorization'),
  { PERM_SYSTEM_ADMIN } = require('../constants'),
  rest = require('../utils/rest'),
  db = require('../db/db'),
  invitationConstraints = require('../utils/constraints/invitationConstraints'),
  responses = require('../utils/responses');

const router = express.Router();
router.use(auth.authorize(PERM_SYSTEM_ADMIN));

router.get('/', (req, res) => {
  rest.restGetCall(() => db.findAllInvitations(), req, res);
});

router.put('/', (req, res) => {
  const data = JSON.parse(req.body);
  const validation = validate(data, invitationConstraints, { fullMessages: false });
  if (validation) {
    Object.entries(validation).forEach(([key, value]) => { [validation[key]] = value; });
    responses.inputErrors(res, validation);
  } else {
    db.checkExistence('name', 'RegKeys', data.name, true, {
      name: 'Invitation name must be unique.',
    }).then(() => db.checkExistence('id', 'Events', data.event, false, {
      event: 'Invalid event.',
    })).then(() => db.checkExistence('id', 'Posts', data.post, false, {
      post: 'Invalid post.',
    })).then(() => db.checkExistence('id', 'Roles', data.role, false, {
      role: 'Invalid role.',
    }))
      .then(() => {
        const regKey = crypto.randomBytes(32).toString('hex');
        db.insertRegKey({
          name: data.name,
          regKey,
          userId: req.session.userId,
          postId: data.post,
          roleId: data.role,
          eventId: data.event,
          singleUse: (data.singleUse ? 1 : 0),
        }).then(() => {
          responses.succeed(res);
        }).catch((error) => {
          console.log(error.message);
          responses.internalServerError(res);
        });
      })
      .catch((error) => {
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

module.exports = router;
