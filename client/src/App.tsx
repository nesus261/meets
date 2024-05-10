import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Panel = lazy(() => import("./pages/Panel"));
const Meeting = lazy(() => import("./pages/Meeting"));
import { useEffect, useState } from "react";

const NoMatch = lazy(() => import("./components/NoMatch"));

function App() {
  const [mode, setMode] = useState("");
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const colorScheme = event.matches ? "dark" : "light";
        document.body.setAttribute("data-bs-theme", colorScheme);
        setMode(colorScheme);
      });
    if (window.matchMedia("(prefers-color-scheme: dark)")?.matches) {
      document.body.setAttribute("data-bs-theme", "dark");
    }
  }, []);
  return (
    <Suspense fallback={<div className="container">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Suspense>
  );
}
export default App;
