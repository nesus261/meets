import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import Button from "./Button";
import Modal from "./Modal";
import Input from "./Input";

const NavBar = () => {
  const [logged, setLogged] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies();
  const location = useLocation();
  const navigate = useNavigate();
  let darkMode = window.matchMedia("(prefers-color-scheme: dark)")?.matches;
  useEffect(() => {
    if (!logged && cookies["session"]) {
      let loc = window.location.origin.split(":");
      const recipeUrl = `${loc[0]}:${loc[1]}:2624/logged`; //"https://somedomain.pl:2624/logged";
      const requestMetadata = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: cookies["session"],
        }),
      };
      fetch(recipeUrl, requestMetadata)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && !logged) {
            setLogged(true);
          } else {
            setLogged(false);
            removeCookie("session");
            if (location.pathname.includes("/panel")) navigate("/login");
          }
        });
    }
  }, []);
  // Join meeting
  const [alertText, setAlertText] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinName, setJoinName] = useState("");
  const joinMeeting = () => {
    if (joinId.length != 12) {
      setAlertText("Incorrect meeting ID");
    } else if (joinName.length < 2) {
      setAlertText("Incorrect name");
    }
    let loc = window.location.origin.split(":");
    const recipeUrl = `${loc[0]}:${loc[1]}:2624/joinMeeting`; //"https://somedomain.pl:2624/joinMeeting";
    const requestMetadata = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: parseInt(joinId),
        password: joinPassword,
        name: joinName,
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

  return (
    <>
      <nav
        className={
          "navbar navbar-expand-lg border-bottom " + (darkMode ? "bg-dark" : "")
        }
        style={darkMode ? {} : { backgroundColor: "#e3f2fd" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Meets
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {
              let el = document.getElementById("navbarNav");
              if (el) {
                if (el.className.includes("show")) {
                  el.className = el.className.replace(" show", "");
                } else {
                  el.className += " show";
                }
              }
            }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav" style={{ width: "100%" }}>
              <li className="nav-item">
                <NavLink to="/" className="nav-link" aria-current="page">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/login" className="nav-link">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/register" className="nav-link">
                  Register
                </NavLink>
              </li>
              {logged && (
                <li className="nav-item">
                  <NavLink to="/panel" className="nav-link">
                    Panel
                  </NavLink>
                </li>
              )}
            </ul>
            <Button
              className="nav-link"
              style={{ margin: "5px", width: "150px", padding: "6px" }}
              onClick={() => {
                openModal("Joinmeeting");
              }}
              color={darkMode ? "dark" : "light"}
            >
              Join meeting
            </Button>
            {logged && (
              <Button
                onClick={() => {
                  setLogged(false);
                  removeCookie("session");
                  if (location.pathname.includes("/panel")) navigate("/login");
                }}
              >
                Wyloguj
              </Button>
            )}
          </div>
        </div>
      </nav>
      <Modal
        name="Join meeting"
        footerButtons={
          <button type="button" className="btn btn-info" onClick={joinMeeting}>
            Join meeting
          </button>
        }
        alertText2={alertText}
        setAlertText2={setAlertText}
      >
        <Input name="ID:" type="number" get={joinId} set={setJoinId}>
          Meeting ID
        </Input>
        <Input
          name="Password"
          type="password"
          marginTop="4px"
          get={joinPassword}
          set={setJoinPassword}
        >
          Meeting password
        </Input>
        <Input name="Name" marginTop="4px" get={joinName} set={setJoinName}>
          Your name
        </Input>
      </Modal>
    </>
  );
};

export default NavBar;
