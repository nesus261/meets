import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  color?: "primary" | "secondary" | "danger" | "dark" | "light" | "info";
  className?: string;
  style?: object;
  onClick?: () => void;
}

const Button = ({
  children,
  color = "info",
  className = "",
  style = {},
  onClick,
}: Props) => {
  return (
    <button
      className={"btn btn-" + color + " " + className}
      onClick={onClick ? onClick : () => {}}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
