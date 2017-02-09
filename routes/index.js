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

var multer = require("multer");
var upload = multer({dest: "public/images"})
var type = upload.single("imageToUpload")
var fs = require("fs")


router.get('/', function(req, res, next) {
    var getImagesQuery = 'select * from images where id not in (select image_id from votes where ip = "'+req.ip+'")';

    connection.query(getImagesQuery, (error,results,fields)=>{
        // res.json(results);
        var randomIndex = (Math.floor(Math.random() * results.length));
        // res.json(results[randomIndex]);
        if(results.length == 0){
            res.render("game_over", {msg: "You finished!"});
        }else{
            res.render('index', {
                title: 'EVIL or NOT',
                imageToRender: "/images/"+results[randomIndex].image_url,
                imageText: results[randomIndex].image_name,
                imageIdToPassToJade: results[randomIndex].id
            });
        };
    });
});

router.get('/vote/:vote_direction/:image_id', (req,res,next)=>{
    // res.json(req.params.vote_direction);
    var imageId = req.params.image_id;
    var voteDirection = req.params.vote_direction;
    if(voteDirection == "evil"){
        voteDirection = 1;
    }else{
        voteDirection = -1;
    }
    var insertVoteQuery = "insert into votes (ip, image_id, vote_direction) values ('"+req.ip+"',"+imageId+",'"+voteDirection+"')";
    // res.json(insertVoteQuery);
    connection.query(insertVoteQuery, (error,results,field)=>{
        if (error) throw error;
        res.redirect("/?"+req.params.image_id+req.params.vote_direction);
    });
});

router.get('/standings', (req,res,next)=>{
    // var totalVotes = req.params.total_votes
    var standingsQuery = "SELECT images.id, images.image_url, images.image_name, SUM(vote_direction) as total_votes from votes inner join images on images.id = votes.image_id group by votes.image_id";
    connection.query(standingsQuery, (error,results,field)=>{
        if (error) throw error;
        // res.json(results);
        res.render('standings', {totalVotes: results});
    });
});

router.get("/testQ", (req,res,next)=>{
    // var id1 = 2;
    // var id2 = 3
    // var query = "select * from images where id > ? and id < ?"
    // connection.query(query, [id1, id2], (error,results,fields)=>{
    //     res.json(results);
    // })

    var insertQuery = "insert into votes (ip, image_id, vote_direction) values ('127.0.0.1','2','1')";
    connection.query(insertQuery, (error,results,fields)=>{
        var query = "select * from votes"
        connection.query(query, (error,results,fields)=>{
            res.json(results);
        });
    });
});

router.get("/uploadImage", (req,res,next)=>{
    res.render("uploadImage", {});
});

router.post("/formSubmit", type, (req,res,next)=>{
    var newCharacter = req.body.characterName;
    var tempPath = req.file.path;
    var targetPath = "public/images/"+req.file.originalname;

    fs.readFile(tempPath, (error,fileContents)=>{
        fs.writeFile(targetPath, fileContents, (error)=>{
            if (error) throw error;
            var insertQuery = "insert into images (image_url, image_name) values (?,?)";
            connection.query(insertQuery, [req.file.originalname, newCharacter], (dberror,results,fields)=>{
                if (dberror) throw dberror;
                fs.unlink(tempPath, (ULerror)=>{
                    if (ULerror) throw ULerror;
                    res.redirect("/?file=uploaded");
                })

            })
            // res.json("Uploaded");
        });
    });
    // res.json(req.file);
});



module.exports = router;
