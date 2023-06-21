import { twMerge } from "tailwind-merge";

const Button = ({ type, children, onClick, className, ...rest }) => {
  return (
    <button
      {...rest}
      type={type || "button"}
      onClick={onClick}
      className={twMerge(
        "bg-amber-600 rounded-md text-white px-4 py-2 cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
