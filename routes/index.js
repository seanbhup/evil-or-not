var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EVIL or NOT'});
});

router.get('/standings', (req,res,next)=>{
    // res.send("plop");
    res.render('standings', {});
});

module.exports = router;
