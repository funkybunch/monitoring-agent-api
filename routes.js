let express = require('express');
let router = express.Router();

let response = {};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.type('text');
  res.status(400).send('Bad Request');
});

/* GET test page. */
router.get('/capacity', function(req, res, next) {
  response["capacity"] = req.app.get('capacity');
  res.type('json');
  res.json(response);
});

module.exports = router;
