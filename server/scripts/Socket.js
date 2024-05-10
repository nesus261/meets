
const fs = require('fs');
const http = require('http');
const https = require('https');
const websocket = require('ws');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

const SocketSession = require('./Socket_session');

module.exports = class Socket {
  constructor(db,server) {
    this.port = 2624;
    this.db = db;
    this.server = server;
    this.sr = {
      meetings: {}
    };
    this.app;
    this.ssl = false;
    this.credentials = this.ssl ? {
      key: fs.readFileSync('/etc/letsencrypt/live/somedomain.pl/privkey.pem','utf8'), 
      cert: fs.readFileSync('/etc/letsencrypt/live/somedomain.pl/fullchain.pem','utf8')
    } : null;
  }
  async init() {
    this.app = express();
    this.app.use(cors({
      origin: '*'
    }))
    //app.use(express.bodyParser({limit:'50mb'}));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.sr.server = this.ssl ? https.createServer(this.credentials, this.app) : http.createServer(this.app);
    
    this.sr.wss = new websocket.Server({ server: this.sr.server });
    this.sr.wss.binaryType = 'arraybuffer';
    
    this.sr.wss.on('connection', (ws)=>{
      let ss = new SocketSession(this.db,this.sr,ws,this);
      ss.init();
    });
    this.server.app = this.app;
    this.sr.server.listen(this.port);
    console.log(`Running process: ${process.pid}`);
  }
  async sendUser(id,sendTo,data) {
    if (this.sr.meetings[id][sendTo])
      this.sr.meetings[id][sendTo].send(data);
  }
  async sendMulticast(id,data) {
    Object.values(this.sr.meetings[id]).forEach((i)=>{
      i.send(data);
    });
  }
}
