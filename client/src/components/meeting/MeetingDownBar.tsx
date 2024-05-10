import React, { useState } from "react";
import { IconContext } from "react-icons";
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
  BsCameraVideoFill,
} from "react-icons/bs";

import Button from "../Button";

import "./MeetingDownBar.css";

interface Props {
  muteFunction: (state: boolean) => void;
  cameraStateFunction: (state: boolean) => void;
}
const controlIconsSettings = { className: "control-icons", size: "30px" };
const styleIcons = { margin: "5px 0px 5px 4px" };
const MeetingDownBar = ({ muteFunction, cameraStateFunction }: Props) => {
  const [muted, setMuted] = useState(true);
  const [cameraState, setCameraState] = useState(false);
  return (
    <ul className="nav bg-body-tertiary fixed-bottom ">
      <li className="nav-item">
        <IconContext.Provider value={controlIconsSettings}>
          <Button
            color={
              window.matchMedia("(prefers-color-scheme: dark)")?.matches
                ? "dark"
                : "light"
            }
            style={styleIcons}
            onClick={() => {
              setMuted(!muted);
              muteFunction(muted);
            }}
          >
            <div>{muted ? <BsMicMute /> : <BsMic />}</div>
          </Button>
        </IconContext.Provider>
      </li>
      <li className="nav-item">
        <IconContext.Provider value={controlIconsSettings}>
          <Button
            color={
              window.matchMedia("(prefers-color-scheme: dark)")?.matches
                ? "dark"
                : "light"
            }
            style={styleIcons}
            onClick={() => {
              setCameraState(!cameraState);
              cameraStateFunction(!cameraState);
            }}
          >
            <div>{cameraState ? <BsCameraVideo /> : <BsCameraVideoOff />}</div>
          </Button>
        </IconContext.Provider>
      </li>
    </ul>
  );
};

export default MeetingDownBar;
