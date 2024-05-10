class WebSocketService {
  private static instance: WebSocketService | null = null;
  private socket: WebSocket | null = null;
  private listeners: Function[] = [];

  private constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }

    this.socket = new WebSocket("ws://localhost:2624"); //"wss://somedomain.pl:2624");
    this.socket.onopen = () => {
      console.log("Połączono z serwerem WebSocket");
      let st = JSON.parse(localStorage.getItem("meeting") || "{}");
      let me = JSON.parse(localStorage.getItem("me") || "{}");
      let send = {
        init: true,
        id: st.id,
        name: me.name,
        session: this.getCookie("session"),
      };
      console.log(send);
      this.send(send);
    };

    this.socket.onclose = () => {
      console.log("Rozłączono z serwerem WebSocket");
    };

    this.socket.onmessage = (event) => {
      this.blobToBufferSource(event.data)
        .then((bufferSource: BufferSource) => {
          const decryptedData = this.decode(bufferSource);
          this.listeners.forEach((listener) => {
            console.log("received", decryptedData);
            listener(decryptedData);
          });
        })
        .catch((error: Error) => {
          console.error("Błąd podczas przetwarzania Blob:", error);
        });
    };

    WebSocketService.instance = this;
  }
  public addEventListener = (listener: Function) => {
    this.listeners.push(listener);
  };
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  async send(data: object) {
    console.log("sent", data);
    let data2 = this.stringify(data);
    data2 = btoa(unescape(encodeURIComponent(data2)));
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
      this.socket.send(this.encode(data2));
  }
  getCookie(cname: string) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  blobToBufferSource(blob: Blob): Promise<BufferSource> {
    return new Promise<BufferSource>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(fileReader.result));
        } else {
          reject(new Error("Błąd podczas odczytu Blob"));
        }
      };
      fileReader.onerror = () => {
        reject(new Error("Błąd odczytu Blob"));
      };
      fileReader.readAsArrayBuffer(blob);
    });
  }
  decode(buf: BufferSource) {
    var toRett = decodeURIComponent(
      escape(atob(new TextDecoder().decode(buf)))
    );
    return JSON.parse(toRett);
  }
  encode(str: string) {
    var buf = new ArrayBuffer(str.length * 1);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  stringify(obj: object) {
    let cache: object[] | null = [];
    let str = JSON.stringify(obj, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache?.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }
}

export default WebSocketService;
