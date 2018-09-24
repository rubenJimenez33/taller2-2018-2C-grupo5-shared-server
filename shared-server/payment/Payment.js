var express = require('express');
var router = express.Router();
var db = require('./PaymentController');
var bodyParser = require('body-parser');
var connect_db = require('../service/Connect');
var TokenController = require('../auth/TokenController');
var morgan = require('morgan');
var logger = require('../others/logger');

router.use(morgan('combined', { stream: logger.stream }));

//start body-parser configuration
router.use(bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//get my payments
router.get('/',connect_db,TokenController.verifyToken,db.getMyPayments);

//create a app server
router.post('/',connect_db,TokenController.verifyToken, db.createPayment);

//get sall paymethods
router.get('/methods',connect_db,TokenController.verifyToken, db.getPaymentMethods);

module.exports = router;