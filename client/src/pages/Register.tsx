import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

import "./Register.css";
import FindOutMore from "../components/FindOutMore";

const Register = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [alertText, setAlertText] = useState("");
  const [cookies, setCookie] = useCookies(["session"]);
  //let alertColor: "danger" | "success";
  //alertColor = "danger";
  const [alertColor, setAlertColor] = useState("danger");

  const handleRegister = async () => {
    if (password != rePassword) {
      setAlertColor("danger");
      setAlertText("Hasła są różne");
      return;
    }
    let loc = location.origin.split(":");
    const recipeUrl = `${loc[0]}:${loc[1]}:2624/register`; //"https://somedomain.pl:2624/register";
    const requestMetadata = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: login,
        pass: password,
      }),
    };
    fetch(recipeUrl, requestMetadata)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setAlertColor("success");
          setAlertText(data.message);
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        } else if (data.message) {
          setAlertColor("danger");
          setAlertText(data.message);
        }
      });
  };
  return (
    <>
      <NavBar />
      <div className="d-flex flex-row mb-3 container-1">
        <div className="p-2 colm-1 bg-body-tertiary">
          <FindOutMore />
        </div>
        <div className="p-2 colm-2">
          <div className="container-2">
            <div className="w-100">
              <center>
                <h2 className="text-uppercase">Register</h2>
                <Input size="l" marginTop="30px" get={login} set={setLogin}>
                  Login
                </Input>
                <Input
                  size="l"
                  type="password"
                  marginTop="20px"
                  get={password}
                  set={setPassword}
                >
                  Password
                </Input>
                <Input
                  size="l"
                  type="password"
                  marginTop="20px"
                  get={rePassword}
                  set={setRePassword}
                >
                  Re-password
                </Input>
                <Button
                  style={{
                    width: "100%",
                    marginTop: "35px",
                    height: "45px",
                    fontSize: "20px",
                  }}
                  onClick={handleRegister}
                >
                  Register
                </Button>
                {alertText && (
                  <Alert
                    onClose={() => setAlertText("")}
                    color={alertColor}
                    style={{ marginTop: "5px" }}
                  >
                    {alertText}
                  </Alert>
                )}
              </center>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
