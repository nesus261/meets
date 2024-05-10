
var MongoClient = require('mongodb').MongoClient;

module.exports = class Database {
  constructor() {
  }
  init() {
    return new Promise((r) => {
      MongoClient.connect("mongodb://localhost:27017", async function(err, client) {
        if(err) { return console.dir(err); }
        this.db = client.db('meets');
        this.users = this.db.collection('users', {strict:true}, function(err, collection) {});
        this.meetings = this.db.collection('meetings', {strict:true}, function(err, collection) {});
        this.meetings.deleteMany({});
        r(this.db);
      }.bind(this));
    });
  }
  
}
