import { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../components/context/context";

export default function TodoHeader() {
  const { dispatch } = useContext(Context);

  const inputRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    dispatch({
      type: "ADD",
      payload: {
        id: Date.now(),
        task: input,
        isCompleted: false,
      },
    });
    setInput("");
    inputRef.current.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="todos__header">
      <h1>📝 Todo App 원본</h1>
      <input
        type="text"
        placeholder="Add a new task..."
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        required
      />
    </form>
  );
}
