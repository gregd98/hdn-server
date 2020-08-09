exports.restGetCall = (promise, req, res) => {
  promise().then((result) => {
    res.status(200).json({ succeed: true, payload: result });
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, message: 'Internal server error.' });
  });
};