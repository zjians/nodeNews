const express = require('express');
const app = new express();
const mongo = require('./model/db.js');
const formidable = require('formidable');
const form = new formidable.IncomingForm();
const session = require("express-session");

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));



app.get('/',(req,res)=>{
  mongo._connect().then((db)=>{
    mongo.find('news',{}).then(result =>{
      console.dir(result);
      res.render('news',{
        'newsList': result
      });
    });
  });
});

app.get('/add',(req,res)=>{
    res.render('add');
});
app.post('/add',(req,res)=>{
  form.parse(req, function(err, fields, files, next) {
    if(err){
      next();
      return;
    }
    mongo._connect().then((db)=>{
          mongo.insert('news',[fields]).then(result =>{
            res.redirect('/')
          });
        });
  })
});

app.get('/login', (req,res)=>{
  res.render('login',{});
});
app.post('/login',(req,res)=>{
  form.parse(req, function(err, fields, files, next) {
    if(err){
      next();
      return;
    }
  mongo._connect().then((db)=>{
    console.dir(fields.uname)
    mongo.find('news',{uname:fields.uname}).then(result =>{
      if(result.length){
        res.send({"message":"用户名已注册","status":-1});
        return
      }
      mongo.insertOne('news',fields).then(resultValue=>{
        res.send({"message":"注册成功,请返回登录","status":1});
      });
    });
  });
});
});

app.get('/sign', (req,res)=>{
  res.render('sign',{});
});
app.post('/sign',(req,res)=>{
  form.parse(req, function(err, fields, files, next) {
    if(err){
      next();
      return;
    }
    mongo.find('news',{uname:fields.uname}).then(result =>{
      console.dir(result[0].upwd)
      if(result.length){
        if(result[0].upwd == fields.upwd){
          req.session.login = "success";
          req.session.username = fields.uname;
          res.send({"message":"登录成功","status":2})
        }
      }else{

      }
    });
});
});
app.use('*',(req,res,next)=>{
  console.log(req.originUrl)
  if(req.session.login==='success'){
    next()
  }else{
    res.status(401).json({"message":"请登录"});
  }
})
app.get('/test',(req,res)=>{
  res.send('这是test');
});

app.all('*',(req,res)=>{
  res.render('err');
});

app.listen(3000);