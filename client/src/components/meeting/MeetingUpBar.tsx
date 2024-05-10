import React from "react";
import { useNavigate } from "react-router-dom";

const MeetingUpBar = () => {
  const navigate = useNavigate();
  let meeting = JSON.parse(localStorage.getItem("meeting") || "{}");
  if (!Object.keys(meeting).length) {
    navigate("/");
  }
  return (
    <ul className="nav bg-body-tertiary fixed-top">
      <li className="nav-item">
        <a
          className="nav-link disabled"
          aria-current="page"
          style={{ margin: "2px", fontSize: "22px" }}
        >
          Meeting ID:{" "}
          {meeting.id &&
            meeting.id
              .toString()
              .replace(/(.{4})/g, "$1 ")
              .trim()}
        </a>
      </li>
    </ul>
  );
};

export default MeetingUpBar;
