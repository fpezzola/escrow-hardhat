const Input = ({ name, type, children }) => {
  return (
    <input
      type={type || "text"}
      name={name}
      className="border rounded-md border-gray"
    >
      {children}
    </input>
  );
};

export default Input;
