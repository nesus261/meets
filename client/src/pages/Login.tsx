import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

import "./Login.css";
import FindOutMore from "../components/FindOutMore";

const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [alertText, setAlertText] = useState(false);
  const [cookies, setCookie] = useCookies();

  const handleLogin = async () => {
    let loc = location.origin.split(":");
    const recipeUrl = `${loc[0]}:${loc[1]}:2624/login`; //"https://somedomain.pl:2624/login";
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
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 365);
          setCookie("session", data.session, {
            path: "/",
            expires: expirationDate,
          });
          localStorage.setItem("me", JSON.stringify({ login: login }));
          navigate("../panel");
        } else if (data.message) {
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
                <h2 className="text-uppercase">Login</h2>
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
                <Button
                  style={{
                    width: "100%",
                    marginTop: "35px",
                    height: "45px",
                    fontSize: "20px",
                  }}
                  onClick={handleLogin}
                >
                  Login
                </Button>
                {alertText && (
                  <Alert
                    onClose={() => setAlertText(false)}
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

export default Login;
