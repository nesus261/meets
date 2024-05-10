import React, { ReactNode, useState } from "react";
import Button from "./Button";
import Alert from "./Alert";

interface Props {
  children: ReactNode;
  name: string;
  footerButtons?: ReactNode;
  alertText2?: string;
  setAlertText2?: (text: string) => void;
}

const Modal = ({
  children,
  name,
  footerButtons,
  alertText2,
  setAlertText2,
}: Props) => {
  const id = name.replace(/\s/g, "");
  const [alertText, setAlertText] = useState("");
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
    <div
      className="modal fade"
      id={id}
      aria-labelledby={id + "Lable"}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div
          className="modal-content"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={id + "Lable"}>
              {name}
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => closeModal(id)}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          {(alertText2 || alertText) && (
            <Alert
              onClose={() => {
                if (setAlertText2) setAlertText2("");
                else setAlertText("");
              }}
              style={{ margin: "5px" }}
            >
              {alertText2 || alertText}
            </Alert>
          )}

          <div className="modal-footer">
            <Button onClick={() => closeModal(id)}>Close</Button>
            {footerButtons}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
