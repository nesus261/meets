module.exports = class CodeWS {
  constructor() {     
  }
  encode(data) {
    let buff = Buffer.from(JSON.stringify(data));
    data = buff.toString('base64');
    var buf = new ArrayBuffer(data.length*1); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=data.length; i<strLen; i++) {
      bufView[i] = data.charCodeAt(i);
    }
    return buf;
  }
  decode(data) {
    data = data.toString();
    let buff = Buffer.from(data, 'base64');
    data = buff.toString();
    try{
      data = JSON.parse(data); 
      return data;
    }
    catch(err)
    {
      console.log(err);
      return false;
    }
  }
}

