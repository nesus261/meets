import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Alert from "../components/Alert";

import "./Panel.css";
import Input from "../components/Input";
import Modal from "../components/Modal";

const Panel = () => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const [alertText, setAlertText] = useState("");
  const navigate = useNavigate();
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const createMeeting = () => {
    if (createName.length < 2) {
      setAlertText("Incorrect name");
    }
    let loc = location.origin.split(":");
    const recipeUrl = `${loc[0]}:${loc[1]}:2624/createMeeting`; //"https://somedomain.pl:2624/createMeeting";
    const requestMetadata = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: cookies["session"],
        password: createPassword,
        name: createName,
      }),
    };
    fetch(recipeUrl, requestMetadata)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          let me = JSON.parse(localStorage.getItem("me") || "{}");
          me.name = data.name;
          localStorage.setItem("me", JSON.stringify(me));
          localStorage.setItem("meeting", JSON.stringify(data.meeting));
          navigate("/meeting");
        } else if (data.message) {
          setAlertText(data.message);
        }
      });
  };
  const openModal = (modal: string) => {
    let el = document.getElementById(modal);
    if (el && !el.className.includes("show")) {
      el.className += " show";
      el.style.display = "block";
    }
  };
  const closeModal = (modal: string) => {
    let el = document.getElementById(modal);
    if (el && el.className.includes("show")) {
      el.className = el.className.replace(" show", "");
      el.style.display = "none";
    }
  };
  return (
    <>
      <NavBar />
      <div style={{ margin: "30px" }}>
        <h1>Panel</h1>
        <Button className="but-1" onClick={() => openModal("Createmeeting")}>
          Create meeting
        </Button>
        <Button className="but-1" onClick={() => openModal("Joinmeeting")}>
          Join meeting
        </Button>
        <Modal
          name="Create meeting"
          alertText2={alertText}
          setAlertText2={setAlertText}
          footerButtons={
            <button
              type="button"
              className="btn btn-info"
              onClick={createMeeting}
            >
              Create meeting
            </button>
          }
        >
          <Input
            name="Password"
            type="password"
            marginTop="4px"
            get={createPassword}
            set={setCreatePassword}
          >
            Meeting password
          </Input>
          <Input
            name="Name"
            marginTop="4px"
            get={createName}
            set={setCreateName}
          >
            Your name
          </Input>
        </Modal>
      </div>
    </>
  );
};

export default Panel;
