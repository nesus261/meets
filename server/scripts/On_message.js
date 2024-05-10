
const CodeWS = require('./Ws_code');
const OnMessage = require('./On_message');


module.exports = class SocketSession {
  constructor(db,sr,ws,socket,socket_session,meeting) {
    this.db = db;
    this.sr = sr;
    this.ws = ws;
    this.sc = socket;
    this.ss = socket_session;
    this.meeting = meeting;
  }
  async run(data) {
    if (data.sendTo)
    {
      this.sc.sendUser(this.meeting.id,data.sendTo,{
        user:this.ss.login.login,
        data:data.data,
        info:data.data.sdp ? this.meeting.users[this.ss.login.login] : null
      });
    }
  }
}
