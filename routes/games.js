const express = require('express'),
  db = require('../db/db'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest');

const router = express.Router();

router.use(auth.authorize());

router.get('/', (req, res) => {
  rest.restGetCall(db.findAllGames, req, res);
});

module.exports = router;
