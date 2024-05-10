
var fs = require('fs');
var https = require('https');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var Database = require('./Database');
var Socket = require('./Socket');

module.exports = class Server {
  constructor() {
    this.db = new Database;
    this.socket = new Socket(this.db,this);
    
    this.app;
    this.registeredip = [];
    this.cookies = {};
  }
  async init() {
    await this.db.init();
    await this.socket.init();
    this.server();
  }
  server() {
    this.app.post('/logged', (req, res) => this.logged(req,res)); 
    this.app.post('/createMeeting', (req, res) => this.createMeeting(req,res)); 
    this.app.post('/joinMeeting', (req, res) => this.joinMeeting(req,res)); 
    this.app.post('/register', (req, res) => this.register(req,res)); 
    this.app.post('/login', (req, res) => this.login(req,res)); 
  }
  async logged(req,res) {
   try {
    let session = Object.entries(this.cookies).find(a=>a[1]==req.body.session);
    if (session)
    {
      //var login = session[0];
      res.send({ok:1});
      res.end();
    }
    else 
    {
      res.send({error:4,message:'Niepoprawne dane logowania'});
      res.end();
    }
   }
   catch {}
  }
  async joinMeeting(req,res) { // do wywalenia - jest na sockecie 
   try {
    let d = req.body;
    let meeting = await this.db.meetings.findOne({id:d.id,pass:d.password});
    if (meeting)
    {
      res.send({ok:1,name:d.name,meeting:meeting});
      res.end();
      return;
    }
    res.send({error:8,message:"Niepoprawne dane spotkania"});
    res.end();
   }
   catch {}
  }
  async createMeeting(req,res) {
   try {
    let d = req.body;
    let session = Object.entries(this.cookies).find(a=>a[1]==d.session);
    if (session)
    {
      var login = session[0];
      if (d.id && (typeof d.id != 'number' || d.id.toString().length != 12 || await this.db.meetings.findOne({id:d.id})))
      {
        res.send({error:7, message: "Niepoprawne id spotkania"});
        res.end();
        return;
      }
      let ret = {
        id: d.id || parseInt(this.randomNumber(12)),
        pass: d.password,
        own: login,
        users: {},
        settings: {
          "connectWithoutHost": true, 
          "grandHostWhenDisconnectingToAnyone": true,
        }
      };
      await this.db.meetings.insertOne(ret);
      res.send({ok:1,name:d.name,meeting:ret});
      res.end();
    }
    else 
    {
      res.send({error:4,message:'Niepoprawne dane logowania'});
      res.end();
    }
   }
   catch {}
  }
  async getNumber(req,res) {
   try {
    let d = req.body;
    res.send({id:parseInt(this.randomNumber(12))});
    res.end();
   }
   catch {}
  }
  async login(req,res) {
    try {
      let login = req.body.login;
      let pass = req.body.pass;
      let data = await this.db.users.findOne({login:login,pass:pass});
      if (!data)
      {
        res.send({error:4,message:'Niepoprawny login lub hasło'});
        res.end();
        return;
      }
      this.cookies[login] = this.randomStr(32);
      res.send({ok:1,message:'Zalogowano',session:this.cookies[login]});
      res.end();
      return;
    }
    catch {}
  }
  async register(req,res) {
    try {
      let ip = req.ip;
      if (this.registeredip[ip] < (new Date).getTime()+86400000)
      {
        res.send({error:6,message:'Odczekaj przed założeniem kolejnego konta'});
        res.end();
        return;
      }
      var login = req.body.login;
      var pass = req.body.pass;
      if (login.length < 5)
      {
        res.send({error:2,message:'Login jest zbyt krótki'});
        res.end();
        return;
      }
      else if (pass.length < 5)
      {
        res.send({error:2,message:'Hasło jest zbyt krótkie'});
        res.end();
        return;
      }
      let check = await this.db.users.findOne({login:login});
      if (!check)
      {
        await this.db.users.insertOne({login:login,pass:pass,meetings:[]}, {w:1}, function(err, result) {
          if (err) { 
            console.log('Error user push');
            res.send({error:1,message:'Database error'});
            res.end();
            return;
          }
          this.registeredip[ip] = (new Date).getTime();
          res.send({ok:1,message:'Zarejestrowano'});
          res.end();
          return;
        }.bind(this));
      }
      else
      {
        res.send({error:2,message:'Login zajęty'});
        res.end();
        return;
      }
    }
    catch {}
  }
  randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max+1);
    return Math.floor(Math.random() * (max - min)) + min;
  }
  randomNumber(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      if (i == 0)
      {
        while (result == '0') result = characters.charAt(Math.floor(Math.random() * charactersLength));
      }
    }
    return parseInt(result);
  }
  randomStr(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

