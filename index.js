var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
 
app.use(bodyParser.urlencoded({ extended: false }));
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "connection"
  });
  app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  app.get('/', function(req,res){
    res.sendFile(path.join(__dirname+'/click.html'));
  });

  app.get('/data', function(req,res){
    res.sendFile(path.join(__dirname+'/login1.html'));
  });

  app.post('/login-data', function(req,res){
    var email= req.body.email;
    var password = req.body.password;
    
    if (email && password) {
      con.query('SELECT * FROM customers WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
        if (results.length > 0) {
          console.log('The solution is: ', results);  
          req.session.loggedin = true;
          req.session.email = email;
          res.redirect('/home');
        } else {
          res.send('Incorrect Username and/or Password!');
        }			
        res.end();
      });
    } else {
      res.send('Please enter email and Password!');
      res.end();
    }
  });
  
  app.get('/home', function(request, response) {
    if (request.session.loggedin) {
      response.send('Welcome back, ' + request.session.email + '!');
    } else {
      response.send('Please login to view this page!');
    }
    response.end();
  });
    

 
app.get('/registration',function(req,res){
  res.sendFile(path.join(__dirname+'/regis.html'))
 }); 
app.post('/submit-login-data',[
  check('uname').isLength({ min: 9 }),
  check('email').custom(email => {
    if (alreadyHaveEmail(email)) {
      throw new Error('Email already registered')
    }
  }),
  
],(req,res) => {
  con.connect(function(err) {
     if (err) throw err;
        var sql = "INSERT INTO customers (uname,email,password ) VALUES ('"+req.body.uname+"','"+req.body.email+"','"+req.body.password+"')";
         con.query(sql, function (err,row) {
           if(err){
             res.status(400).send(err);
           }
          res.status(200).send('Your Data is saved... ');
          console.log('Data received from Db:\n');
          if (err) throw err;
          console.log("1 record inserted");
          res.end();
         });
   });
 });
app.listen(3333);
console.log("Running at Port 3333");