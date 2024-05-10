import React from "react";
import { useState } from "react";
import { ReactNode } from "react";

interface Props {
  children: string;
  size?: "s" | "m" | "l";
  type?: "text" | "password" | "number";
  marginTop?: string;
  name?: string;
  get?: string;
  set?: (toSet: string) => void;
}

const Input = ({
  children,
  size = "m",
  type = "text",
  marginTop,
  name,
  get,
  set,
}: Props) => {
  const [inputValue, setInputValue] = useState(get || "");
  return (
    <div
      className={
        "input-group " +
        (size == "s" ? "input-group-sm" : size == "l" ? "input-group-lg" : "")
      }
      style={marginTop ? { marginTop: marginTop } : {}}
    >
      {name && <span className="input-group-text">{name}</span>}
      <input
        type={type}
        className="form-control"
        aria-label="Sizing example input"
        aria-describedby="inputGroup-sizing-sm"
        placeholder={children}
        value={inputValue}
        onChange={(event) => {
          if (set) set(event.target.value);
          setInputValue(event.target.value);
        }}
      />
    </div>
  );
};

export default Input;
