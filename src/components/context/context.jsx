import { Context } from "./TodoContext";
import { useStoredState } from "../useStoredState";

const sampleTodos = [
  { id: 1, task: "컴퓨터구조 과제 제출", priority: 90, isCompleted: false },
  { id: 2, task: "React 팀 프로젝트 진행", priority: 75, isCompleted: false },
  { id: 3, task: "운동 30분", priority: 50, isCompleted: false },
];

export function ContextProvider({ children }) {
  const [todos, setTodos] = useStoredState("planner-todos", sampleTodos);

  function dispatch(action) {
    setTodos(previous => {
      if (action.type === "ADD") return [...previous, action.payload];
      if (action.type === "DELETE") return previous.filter(todo => todo.id !== action.payload);
      if (action.type === "TOGGLE") return previous.map(todo => todo.id === action.payload ? {
        ...todo,
        isCompleted: !todo.isCompleted,
        completedAt: todo.isCompleted ? null : new Date().toISOString(),
      } : todo);
      return previous;
    });
  }

  return <Context.Provider value={{ todos, dispatch }}>{children}</Context.Provider>;
}
