var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bcrypt = require('bcryptjs');

// Load User Model 
require('../models/Users');
var User = mongoose.model('Users');

//route to register user
router.get('/register', function(req,res){
    res.render('users/register');
});

router.post('/register',function(req,res){
    var errors = [];

    if(req.body.password != req.body.password2){
        errors.push({text:"Passowrds Do Not Match"});
    }

    if(req.body.password.length < 4){
        errors.push({text:"Passowrd Must Be At Least 4 Charecters"});
    }

    if(errors.length > 0){
        res.render('users/register', {
            errors:errors,
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            password2:req.body.passowrd,
        });
    }else{
        User.findOne({email:req.body.email}).then(function(user){
            if(user){
                // add flash message that user exists
                res.redirect("/users/register");
            }
            else{
                var newUser = new User({
                    name:req.body.name,
                    email:req.body.email,
                    password:req.body.password
                });
            
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(newUser.password, salt, function(err, hash){
                        if(err)throw err;
                        newUser.password = hash;
                        new User(newUser).save().then(function(user){
                            //flash message
                            res.redirect('/login');
                        }).catch(function(err){
                            console.log(err);
                            return;
                        });
                    });
                });

                /**/
            }
        })
    }

    /**/
});

module.exports = router;