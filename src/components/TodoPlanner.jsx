import { useContext, useState } from "react";
import { Context } from "./context/TodoContext";
import { Icon, Segments } from "./ui";

const filters = ["전체", "진행중", "완료"];
const adjustments = {
  1: [5, "마감 임박 및 가중치 상향 (+5점)"],
  2: [10, "협업 일정 우선순위 보정 (+10점)"],
  3: [10, "뇌 피로도 완화 및 집중력 회복 추천 (+10점)"],
};
const score = todo => Math.min(100, (todo.priority ?? 85) + (adjustments[todo.id]?.[0] ?? 0));

export function TodoPlanner() {
  return <div className="todo-grid"><TodoPanel /><TodoPanel ranked /></div>;
}

function TodoPanel({ ranked = false }) {
  const { todos, dispatch } = useContext(Context);
  const [filter, setFilter] = useState(filters[0]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState(85);
  const pending = todos.filter(todo => !todo.isCompleted).length;
  const sorted = ranked ? [...todos].sort((a, b) => score(b) - score(a)) : todos;
  const visible = sorted.filter(todo => filter === filters[0] || todo.isCompleted === (filter === filters[2]));

  function add(event) {
    event.preventDefault();
    const task = input.trim();
    if (!task) return;
    dispatch({ type: "ADD", payload: { id: crypto.randomUUID(), task, priority, isCompleted: false } });
    setInput("");
  }

  return (
    <section className="card todo-panel">
      <div className="panel-heading">
        <div>
          <h1>{ranked ? "AI 우선순위 정렬" : "내 할 일 목록"} {ranked && <span className="pill purple">AI 최적화</span>}</h1>
          <p>{ranked ? "마감일, 가중치, 학업 효율을 분석한 최적 실행 순서" : "직접 등록한 할 일 및 기본 설정 순서"}</p>
        </div>
        <span className={`pill ${ranked ? "purple" : ""}`}>{ranked && <Icon name="todo-8" />}{ranked ? "스마트 분석" : "기본 정렬"}</span>
      </div>
      {ranked ? <div className="analysis-banner"><span>중간고사 D-14 학업 가중치 반영 완료</span><strong>실행 효율 +24% 예상</strong></div> :
        <form className="task-form" onSubmit={add}>
          <input aria-label="새로운 할 일" placeholder="새로운 할 일을 입력하세요..." value={input} onChange={event => setInput(event.target.value)} required />
          <div className="priority-control">
            <label htmlFor="priority">중요도</label><small>0</small>
            <input id="priority" type="range" min="0" max="100" value={priority} style={{ "--priority": `${priority}%` }} onChange={event => setPriority(event.target.valueAsNumber)} />
            <small>100</small>
            <input type="number" aria-label="중요도 점수" min="0" max="100" value={priority} onChange={event => setPriority(Math.min(100, Math.max(0, Number(event.target.value))))} />
            <button className="primary" type="submit">추가</button>
          </div>
        </form>}
      <ul className={`task-list ${ranked ? "ranked" : ""}`}>
        {visible.map(todo => <li key={todo.id}>
          {ranked && <span className="rank">{sorted.indexOf(todo) + 1}</span>}
          <label className="task-label">
            <input type="checkbox" checked={todo.isCompleted} onChange={() => dispatch({ type: "TOGGLE", payload: todo.id })} />
            <span className={todo.isCompleted ? "done" : ""}>{todo.task}
              {ranked && <small>{adjustments[todo.id]?.[1] ?? "등록한 중요도 반영"}</small>}
            </span>
          </label>
          <span className="pill purple">{ranked ? `${score(todo)}점` : todo.priority ?? 85}</span>
          <button className="delete" aria-label={`${todo.task} 삭제`} onClick={() => dispatch({ type: "DELETE", payload: todo.id })}>삭제</button>
        </li>)}
        {!visible.length && <li className="empty">표시할 할 일이 없습니다.</li>}
      </ul>
      <footer className="task-footer">
        <Segments label={ranked ? "AI 정렬 필터" : "할 일 필터"} options={filters} selected={filter} onChange={setFilter} />
        <p>남은 할 일: {pending}개</p>
      </footer>
    </section>
  );
}
