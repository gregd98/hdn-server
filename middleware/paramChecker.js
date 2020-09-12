const utils = require('../utils/utils'),
  responses = require('../utils/responses');

exports.checkId = () => (req, res, next) => {
  if (utils.checkId(req.params.id)) {
    next();
  } else {
    responses.badRequest(res);
  }
};
