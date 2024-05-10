
const CodeWS = require('./Ws_code');
const OnMessage = require('./On_message');


module.exports = class SocketSession {
  constructor(db,sr,ws,socket) {
    this.db = db;
    this.sr = sr;
    this.ws = ws;
    this.sc = socket;
    
    this.login = {
      init:false
    };
    this.meeting = {};
    
    this.cd = new CodeWS;
    this.onMessage = new OnMessage(this.db,this.sr,this.ws,this.sc,this,this.meeting);
  }
  init() {
    this.ws.on('message', function(a){this.socketMessage(a);}.bind(this));
    this.ws.on('close', function(a){this.socketClose(a);}.bind(this));
  }
  async socketMessage(data) {
    data = this.cd.decode(data);
    if (data.init == true && !this.login.init) this.initClient(data);
    else if (this.login.init) this.onMessage.run(data);
  }
  async socketClose(data) {console.log(this.meeting);
    if (typeof this.meeting.users == 'object' && this.meeting.users[this.login.login])
    {
      delete this.meeting.users[this.login.login];
      let toUnset = {};
      toUnset[`users.${this.login.login}`] = true;
      await this.db.meetings.updateOne({id:this.meeting.id},{$unset:toUnset});
    }
    for (let user of Object.keys(this.sr.meetings[this.meeting.id] || {}))
    {
      if(user != this.login.login)
      { 
       await this.sc.sendUser(this.meeting.id,user,{
        user:this.login.login,
        data:{disconnected:1}
       });
      }
    }
    if (this.sr.meetings[this.meeting.id] && this.sr.meetings[this.meeting.id][this.login.login]) delete this.sr.meetings[this.meeting.id][this.login.login];
    console.log(`Close connection of user ${this.login.login} from meeting ${this.meeting.id}`);
  }
  async initClient(data) {
   try {
    let session = Object.entries(this.sc.server.cookies).find(a=>a[1]==data.session);
    this.login.login = session ? session[0] : null;
    if (!this.login.login)
    {
      this.sc.server.cookies[data.session] = this.randomStr(12);
      this.login.login = this.sc.server.cookies[data.session];
    }
    this.login.name = data.name;
    this.login.sdp = data.sdp;
    if (this.login.login)
    {
      if (await this.db.users.findOne({login:this.login.login}))
      {
        this.login.logged = true;
      }
      let meeting = await this.db.meetings.findOne({id:data.id});
        console.log(meeting,this.meeting);
      if (meeting)
      {
        while (this.sr.meetings[data.id] && this.sr.meetings[data.id][this.login.login]) 
        {
          await this.sleep(400);
        }
        for (let [n,v] of Object.entries(meeting)) this.meeting[n] = v;
        if (this.login.login == this.meeting.own)
        {
          this.meeting.users[this.login.login] = {
            user: this.login.login,
            name: this.login.name,
            host: 1,
            permissions: 1
          }
          this.login.host = 1;
        }
        else if (!Object.values(this.meeting.users).find(a=>a.host))
        {
          this.meeting.users[this.login.login] = {
            user: this.login.login,
            name: this.login.name,
            host: 1
          }
          if (this.meeting.settings.grandHostWhenDisconnectingToAnyone)
          {
            this.meeting.users[this.login.login].permissions = 1;
            this.login.host = 1;
          }
          else if (this.meeting.setting.connectWithoutHost)
          {
            this.meeting.users[this.login.login].permissions = 0;
            this.login.host = 2;
          }
          else 
          {
            this.send({error:9,message:"Brak hosta"});
            return;
          }
        }
        else 
        {
          this.meeting.users[this.login.login] = {
            user: this.login.login,
            name: this.login.name,
            permissions: 0
          }
        }
        let user = {};
        user[`users.${this.login.login}`] = this.meeting.users[this.login.login];
        await this.db.meetings.updateOne({id:data.id},{$set:user});
        
        this.login.init = true;
        meeting = await this.db.meetings.findOne({id:data.id});
        for (let [n,v] of Object.entries(meeting)) this.meeting[n] = v;
        let toRet = {init:true,youreHost:this.login.host,meeting:this.meeting,login:this.login.login};
        if (!this.sr.meetings[data.id])
        {
          this.sr.meetings[data.id] = {};
        }
        this.sr.meetings[data.id][this.login.login] = this;
        this.send(toRet);
        return;
      }
      this.send({error:8,message:"Brak spotkania"});
    }
    else 
    {
      await this.send({init:false,reason:'Nie jesteś zalogowany'});
      this.ws.close();
    }
   }
   catch(err) {
     console.log('err',err);
   }
  }
  async send(data) {
    data = this.cd.encode(data);
    this.ws.send(data);
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
  sleep(time) { 
    return new Promise(r => setTimeout(r, time)); 
  } 
}
