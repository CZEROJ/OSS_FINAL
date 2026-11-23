import { useEffect, useState } from "react";
import { ContextProvider } from "./components/context/context";
import { TodoPlanner } from "./components/TodoPlanner";
import { Calendar, Exams, Chat, Stats } from "./components/Views";
import { Icon } from "./components/ui";
import { useStoredState } from "./components/useStoredState";

const pages = [
  ["dashboard", "대시보드"], ["tasks", "할 일 관리"], ["calendar", "캘린더"],
  ["exams", "자격증 일정"], ["chat", "AI 추천"], ["stats", "통계"],
];

function currentPage() {
  const hash = window.location.hash.slice(1);
  return pages.some(([key]) => key === hash) ? hash : "dashboard";
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [dark, setDark] = useStoredState("planner-theme", false);
  const [settings, setSettings] = useState(false);
  const [events, setEvents] = useStoredState("planner-events", []);
  const dashboard = page === "dashboard" || page === "tasks";

  useEffect(() => {
    const update = () => setPage(currentPage());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  function navigate(key) {
    window.location.hash = key;
    setPage(key);
  }

  return (
    <ContextProvider>
      <div className={`app ${dark ? "dark" : ""} ${dashboard ? "dashboard" : ""} ${page === "chat" ? "chat-page" : ""}`}>
        <header className="topbar">
          <a href="#dashboard" onClick={() => navigate("dashboard")} className="brand">{!dashboard && <Icon name="cal-7" />}Todo Planner</a>
          <div className="header-actions">
            <button className="theme" role="switch" aria-checked={dark} onClick={() => setDark(!dark)}>
              <Icon name="todo-0" /> 다크 모드 <span className="switch" />
            </button>
            {!dashboard && <button className="profile" aria-label="설정" onClick={() => setSettings(true)}><Icon name="cal-9" /></button>}
          </div>
        </header>
        <aside className="sidebar">
          {page === "chat" && <a className="chat-brand brand" href="#dashboard"><Icon name="chat-14" />Todo Planner</a>}
          <div className="midterm"><span>● 중간고사</span> <b>D-14</b></div>
          <nav aria-label="주 메뉴">
            {pages.map(([key, label], i) => <a key={key} href={`#${key}`} onClick={() => navigate(key)} aria-current={page === key ? "page" : undefined}>
              <Icon name={`todo-${i + 1}`} />{label}
            </a>)}
          </nav>
          <button className="settings-link" onClick={() => setSettings(true)}><Icon name="todo-7" /> 설정</button>
        </aside>
        <main className="workspace">
          {dashboard && <TodoPlanner />}
          {page === "calendar" && <Calendar events={events} setEvents={setEvents} />}
          {page === "exams" && <Exams setEvents={setEvents} />}
          {page === "chat" && <Chat />}
          {page === "stats" && <Stats navigate={navigate} />}
        </main>
        {settings && <div className="modal-backdrop" onClick={() => setSettings(false)}>
          <section className="card modal" role="dialog" aria-modal="true" aria-label="설정" onClick={event => event.stopPropagation()}>
            <h2>설정</h2>
            <label><input type="checkbox" checked={dark} onChange={event => setDark(event.target.checked)} /> 다크 모드</label>
            <button className="primary" onClick={() => setSettings(false)}>닫기</button>
          </section>
        </div>}
      </div>
    </ContextProvider>
  );
}
