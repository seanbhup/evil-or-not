var express = require('express');
var router = express.Router();
var config = require("../config/config.js")
var mysql = require("mysql");
var connection = mysql.createConnection ({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

connection.connect();


router.get('/', function(req, res, next) {
    var getImagesQuery = "select * from images";
    connection.query(getImagesQuery, (error,results,fields)=>{
        // res.json(results);
        var randomIndex = (Math.floor(Math.random() * results.length));
        // res.json(results[randomIndex]);
        res.render('index', {
            title: 'EVIL or NOT',
            imageToRender: "/images/"+results[randomIndex].image_url,
            imageText: results[randomIndex].image_name,
            imageIdToPassToJade: results[randomIndex].id
        });
    });
});

router.get('/vote/:vote_direction/:image_id', (req,res,next)=>{
    // res.json(req.params.vote_direction);
    var imageId = req.params.image_id;
    var voteDirection = req.params.vote_direction;
    var insertVoteQuery = "insert into votes (ip, image_id, vote_direction) values ('"+req.ip+"',"+imageId+",'"+voteDirection+"')";
    res.json(insertVoteQuery);
});

router.get('/standings', (req,res,next)=>{
    res.render('standings', {});
});

module.exports = router;
