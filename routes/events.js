const express = require('express'),
  auth = require('../middleware/authorization'),
  { PERM_SYSTEM_ADMIN } = require('../constants'),
  rest = require('../utils/rest'),
  db = require('../db/db'),
  responses = require('../utils/responses');

const router = express.Router();
router.use(auth.authorize(PERM_SYSTEM_ADMIN));

router.get('/', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllEvents(), req, res);
});

router.put('/', auth.authorize(PERM_SYSTEM_ADMIN), (req, res) => {
  const data = JSON.parse(req.body);
  db.checkExistence('name', 'Events', data.name, true, {
    name: 'Invitation name must be unique.',
  }).then(() => {
    db.insertEvent({
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
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
});

module.exports = router;
