const responses = require('./responses');

exports.restGetCall = (promise, req, res) => {
  promise().then((result) => {
    responses.rest(res, result);
  }).catch((error) => {
    console.log(error.message);
    responses.internalServerError(res);
  });
};
