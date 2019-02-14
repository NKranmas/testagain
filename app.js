var express = require('express');
var app = express();
var methodOvertide = require("method-override");
var port = process.env.PORT || 5000;
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');

var {ensureAuthenticated} = require('./helpers/auth');

var users = require('./routes/users');

var db = require('./config/database');

require('./config/passport')(passport);

mongoose.Promise = global.Promise;

//connect to mongodb using mongoose 
mongoose.connect(db.mongoURI, {
    useMongoClient:true
}).then(function(){
    console.log("Connected to the Monogo Database")
}).catch(function(err){
    console.log(err);
});

require('./models/Entry');
var Entry = mongoose.model('Entries');
require('./models/Users');
var User = mongoose.model('Users');

app.engine('handlebars',exphbs({
    defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

// functions to use body parser 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//setup express session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

//setp passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//route to index.html
/*router.get('/',ensureAuthenticated ,function(req, res){
    //res.sendFile(path.join(__dirname+'/index.html'));

    res.render('index', {
    });
});*/

router.get('/entries',ensureAuthenticated, function(req, res){
    res.render('gameentries/addgame', {user:req.user});
});

//route to edit game entries
router.get('/gameentries/editgame/:id',function(req, res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
        res.render('gameentries/editgame',{user:req.user,entry:entry});
    });
});

//route to put editied entry
router.put('/editgame/:id', function(req,res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){

        entry.title = req.body.title;
        entry.genre = req.body.genre;

        entry.save().then(function(idea){
            res.redirect('/');
        })
    });
});

router.get('/userlist/:id', function(req, res){
    Entry.find({
        user:req.params.id,
    }).then(function(entries){
        res.render('userlist',{
            entries:entries
        })
    });
});

router.get('/login',function(req, res){
    res.render('login', {
    });
});

router.post('/login', function(req,res,next){
    passport.authenticate('local', {
        successRedirect:'/gamers',
        failureRedirect:'/login',   
        failureFlash:true    
    })(req,res,next);
});

router.get('/logout',function(req,res){
    req.logout();
    req.flash('success_msg', "You successfully logged out")
    res.redirect('/login');
});

app.use(methodOvertide('_method'));

//index route
app.get('/gamers',ensureAuthenticated, function(req,res){
    //console.log("Request made from fetch");
    Entry.find({user:req.user.id}).then(function(entries){
        res.render("index",{entries:entries});
    });
});

// gamers route
app.get('/', function(req,res){
    //console.log("Request made from fetch");
    User.find({}).then(function(users){
        res.render("games",{users:users});
    });
});

//route to entries.html
router.get('/entries',ensureAuthenticated, function(req, res){
    res.sendFile(path.join(__dirname+'/entries.html')).then(function(entries){
        res.render("index",{user:req.user});
    });;
});

//post for form on addgame
app.post('/addgame', function(req,res){
    console.log(req.body);
    var newEntry = {
        title:req.body.title,
        genre:req.body.genre,
        user:req.user.id
    }

    new Entry(newEntry).save().then(function(entry){
        res.redirect('/gamers');
    });
});

app.delete('/:id', function(req,res){
    Entry.remove({_id:req.params.id}).then(function(){
        req.flash('success_msg','Game Entry was deleted');
        res.redirect('/gamers');
    });
});

//routs for paths
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'))
app.use('/', router);
app.use('/users', users);

//starts the server 
app.listen(port, function(){
    console.log("server is running on port: " + port);
});