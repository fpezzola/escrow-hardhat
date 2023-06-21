import { twMerge } from "tailwind-merge";
const Card = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        "p-4 border border-gray rounded-md bg-white flex-1 h-auto shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
