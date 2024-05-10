import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import MeetingUpBar from "../components/meeting/MeetingUpBar";
import MeetingDownBar from "../components/meeting/MeetingDownBar";
import WebSocketService from "../scripts/WebSocketService";

import "./Meeting.css";

let users: any = {};
let me: any = {};
let webSocketService: WebSocketService;
let videoTrack: MediaStreamTrack | null;
let audioTrack: MediaStreamTrack | null;
const Meeting = () => {
  const [barsVisibility, setBarsVisibility] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies();
  const navigate = useNavigate();
  const muteFunction = (state: boolean) => {
    if (!audioTrack) return;
    console.log(state);
    if (state) {
      audioTrack.enabled = true;
    } else {
      audioTrack.enabled = false;
    }
  };
  const cameraStateFunction = (state: boolean) => {
    if (!videoTrack) return;
    console.log(state);
    if (state) {
      videoTrack.enabled = true;
    } else {
      videoTrack.enabled = false;
    }
  };
  const addVideoElement = (user: any) => {
    let video = document.createElement("video");
    video.autoplay = true;
    video.srcObject = user.stream;

    let div = document.createElement("div");
    div.id = `remote-video-${user.info.name}`;
    div.appendChild(video);
    let p = document.createElement("p");
    p.className = "sticky-bottom";
    p.style.marginTop = "-30px";
    p.style.marginLeft = "5px";
    p.innerText = user.info.name;
    div.appendChild(video);
    div.appendChild(p);

    document.getElementById("video-grid")?.appendChild(div);
  };
  useEffect(() => {
    (async () => {
      let myStream: MediaProvider | null;
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        videoTrack = myStream.getVideoTracks()[0];
        audioTrack = myStream.getAudioTracks()[0];

        if (audioTrack) audioTrack.enabled = false;
        if (videoTrack) videoTrack.enabled = false;
      } catch (error) {
        myStream = new MediaStream();
      }
      let myVideoEl = document.getElementById(
        "local-video"
      ) as HTMLVideoElement | null;
      if (myVideoEl) {
        myVideoEl.srcObject = myStream;
      }
      if (webSocketService) return;
      webSocketService = WebSocketService.getInstance();
      const handleData = async (data: any) => {
        if (data.error) {
          alert(data.message);
          navigate("/panel");
        }
        if (data.init) {
          me = JSON.parse(localStorage.getItem("me") || "{}");
          let i = data.login;
          console.log(data.login, i);
          if (i && i != me.login) {
            me.login = i;
            localStorage.setItem("me", JSON.stringify(me));
          }
          data.meeting.users[i].me = true;
          if (data.name) {
            data.meeting.users[i].name = data.name;
            me.name = data.name;
            localStorage.setItem("me", JSON.stringify(me));
          }
          let localName = document.getElementById("local-name");
          if (localName) localName.innerText = me.name;
          localStorage.setItem("meeting", JSON.stringify(data.meeting));
          Object.values(data.meeting.users).forEach((a: any) => {
            // first step connection p2p
            if (1) {
              if (me.login == a.user) {
                users[a.user] = {
                  info: a,
                  me: true,
                };
              } else {
                users[a.user] = {
                  info: a,
                  com: {
                    localConnection: new RTCPeerConnection(),
                  },
                  stream: new MediaStream(),
                };
                users[a.user].com.localConnection.onicecandidate = () => {
                  if (users[a.user].com.indicated) return;
                  users[a.user].com.indicated = true;
                  webSocketService.send({
                    sendTo: a.user,
                    data: {
                      sdp: users[a.user].com.localConnection.localDescription,
                    },
                  });
                };
                users[a.user].com.textChannel =
                  users[a.user].com.localConnection.createDataChannel(
                    "textChannel"
                  );
                users[a.user].com.textChannel.onmessage = (e: any) =>
                  console.log("messsage received!!!" + e.data);
                users[a.user].com.textChannel.onopen = (e: any) => {
                  console.log("open!!!!");
                  users[a.user].com.textChannel.send("test1");
                };
                users[a.user].com.textChannel.onclose = (e: any) =>
                  console.log("closed!!!!!!");
                users[a.user].com.localConnection.ontrack = (
                  event: RTCTrackEvent
                ) => {
                  users[a.user].stream.addTrack(event.track);
                };
                if (videoTrack) {
                  users[a.user].com.localConnection.addTrack(
                    videoTrack,
                    myStream
                  );
                }
                if (audioTrack) {
                  users[a.user].com.localConnection.addTrack(
                    audioTrack,
                    myStream
                  );
                }

                users[a.user].com.localConnection
                  .createOffer()
                  .then((o: any) => {
                    users[a.user].com.localConnection.setLocalDescription(o);
                  });
                addVideoElement(users[a.user]);
              }
            }
          });
        }
        if (data.user) {
          if (data.data.sdp) {
            // second step connection p2p
            users[data.user] = {
              nn: 4,
              info: data.info,
              com: {
                localConnection: new RTCPeerConnection(),
              },
              stream: new MediaStream(),
            };
            users[data.user].com.localConnection.onicecandidate = () => {
              if (users[data.user].com.indicated) return;
              users[data.user].com.indicated = true;
              webSocketService.send({
                sendTo: data.user,
                data: {
                  reSdp: users[data.user].com.localConnection.localDescription,
                },
              });
            };
            users[data.user].com.localConnection.ontrack = (
              event: RTCTrackEvent
            ) => {
              users[data.user].stream.addTrack(event.track);
            };
            users[data.user].com.localConnection.ondatachannel = (e: any) => {
              users[data.user].com.textChannel = e.channel;
              users[data.user].com.textChannel.onmessage = (e: any) =>
                console.log("messsage received!!!" + e.data);
              users[data.user].com.textChannel.onopen = (e: any) =>
                console.log("open!!!!");
              users[data.user].com.textChannel.onclose = (e: any) =>
                console.log("closed!!!!!!");
              users[data.user].com.localConnection.channel =
                users[data.user].com.textChannel;
            };

            if (videoTrack) {
              users[data.user].com.localConnection.addTrack(
                videoTrack,
                myStream
              );
            }
            if (audioTrack) {
              users[data.user].com.localConnection.addTrack(
                audioTrack,
                myStream
              );
            }

            users[data.user].com.localConnection
              .setRemoteDescription(data.data.sdp)
              .then((a: any) => console.log("set remote sdp"));
            await users[data.user].com.localConnection
              .createAnswer()
              .then((a: any) => {
                users[data.user].com.localConnection.setLocalDescription(a);
              });
            addVideoElement(users[data.user]);
          } else if (data.data.reSdp) {
            // last step connection p2p
            users[data.user].com.localConnection
              .setRemoteDescription(data.data.reSdp)
              .then((a: any) => console.log("set local sdp"));
          } else if (data.data.disconnected) {
            // delete user when he disconnected
            await document
              .getElementById(`remote-video-${users[data.user].info.name}`)
              ?.remove();
            delete users[data.user];
          }
        }
      };

      webSocketService.addEventListener(handleData);
    })();
  }, []);

  return (
    <div>
      {barsVisibility && <MeetingUpBar />}
      <div
        id="div-meeting"
        onClick={() => {
          let el = document.getElementById("video-grid");
          if (el?.style) {
            let margin = barsVisibility ? "0px" : "55px";
            el.style.marginTop = margin;
            el.style.marginBottom = margin;
          }
          setBarsVisibility(!barsVisibility);
        }}
      >
        <div id="video-grid">
          <div>
            <video id="local-video" autoPlay muted></video>
            <p
              id="local-name"
              className="sticky-bottom"
              style={{ marginTop: "-30px", marginLeft: "5px" }}
            ></p>
          </div>
        </div>
      </div>
      {barsVisibility && (
        <MeetingDownBar
          muteFunction={muteFunction}
          cameraStateFunction={cameraStateFunction}
        />
      )}
    </div>
  );
};

export default Meeting;
