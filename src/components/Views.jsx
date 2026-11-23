import { useContext, useRef, useState } from "react";
import { Context } from "./context/TodoContext";
import { Icon, Segments } from "./ui";
import { useStoredState } from "./useStoredState";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const sampleDay = "2025-05-19";
const dayKey = date => [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(value => String(value).padStart(2, "0")).join("-");
const toDate = key => new Date(key + "T00:00:00");
const moveDay = (date, offset) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
const sampleEvents = [
  [2, "OS 퀴즈", "과제"], [7, "알고리즘 랩", "강의"], [9, "정처기 마감", "시험"],
  [10, "알고리즘 스터디", "개인"], [12, "컴네트", "강의"], [14, "DB 팀플 1차", "과제"],
  [19, "컴퓨터 네트워크", "강의", "10:00 - 12:00", "IT관 302호"],
  [19, "알고리즘 실습", "강의", "14:00 - 16:00", "소프트웨어관 105호"],
  [19, "컴퓨터구조 과제 제출", "과제", "23:59 마감", "MIPS 어셈블러 시뮬레이터 보고서 (LMS 등록)"],
  [21, "전공 PPT 초안", "과제"], [31, "SQLD 시험 (D-12)", "시험"],
].map(([day, title, category, time, detail], i) => ({ id: `sample-${i}`, date: dayKey(new Date(2025, 4, day)), title, category, time, detail }));

export function Calendar({ events, setEvents }) {
  const [selected, select] = useState(sampleDay);
  const [month, setMonth] = useState(() => toDate(sampleDay));
  const [view, setView] = useState("월간");
  const [title, setTitle] = useState("");
  const [checked, setChecked] = useStoredState("planner-calendar-checked", {});
  const input = useRef(null);
  const all = [...sampleEvents, ...events];
  const selectedEvents = all.filter(item => item.date === selected);
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthLength = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekStart = moveDay(toDate(selected), -toDate(selected).getDay());
  const first = view === "주간" ? weekStart : moveDay(monthStart, -monthStart.getDay());
  const days = Array.from({ length: view === "주간" ? 7 : Math.ceil((monthStart.getDay() + monthLength) / 7) * 7 }, (_, i) => moveDay(first, i));
  const monthEvents = all.filter(item => item.date.startsWith(dayKey(month).slice(0, 7))).sort((a, b) => a.date.localeCompare(b.date));

  function choose(date) {
    setMonth(date);
    select(dayKey(date));
  }

  function shift(direction) {
    choose(view === "주간" ? moveDay(toDate(selected), 7 * direction) : new Date(month.getFullYear(), month.getMonth() + direction, 1));
  }

  function add(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setEvents(previous => [...previous, { id: crypto.randomUUID(), date: selected, title: title.trim(), category: "개인" }]);
    setTitle("");
  }

  return <>
    <div className="card calendar-tools">
      <div className="inline"><h1><Icon name="todo-3" /> 캘린더</h1><span className="pill purple">2025학년도 1학기</span></div>
      <div className="inline"><div className="date-nav"><button aria-label="이전 기간" onClick={() => shift(-1)}><Icon name="cal-0" /></button><b>{month.getFullYear()}년 {month.getMonth() + 1}월</b><button aria-label="다음 기간" onClick={() => shift(1)}><Icon name="cal-1" /></button></div>
        <button className="soft" onClick={() => choose(new Date())}>오늘 ({new Date().getMonth() + 1}.{new Date().getDate()})</button></div>
      <div className="inline calendar-actions"><Segments label="캘린더 보기" options={["월간", "주간", "목록"]} selected={view} onChange={setView} /><button className="primary" onClick={() => input.current.focus()}><Icon name="cal-2" /> 일정 등록</button></div>
    </div>
    <div className="calendar-layout">
      <section className="card month-card" aria-label="일정 달력">
        {view === "목록" ? <ul className="event-list">{monthEvents.map(item => <li key={item.id}><button onClick={() => choose(toDate(item.date))}>{item.date} · {item.title}</button></li>)}{!monthEvents.length && <li>등록된 일정이 없습니다.</li>}</ul> : <>
          <div className="weekday-grid">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
          <div className="days-grid">{days.map(date => {
            const key = dayKey(date);
            const holiday = { "2025-05-01": "근로자의날", "2025-05-05": "어린이날", "2025-05-06": "대체공휴일", "2025-05-15": "스승의날" }[key];
            return <button key={key} className={`day ${date.getMonth() !== month.getMonth() ? "outside" : ""}`} aria-label={key} aria-pressed={key === selected} onClick={() => choose(date)}>
              <span className="day-number"><b>{date.getDate()}</b>{key === sampleDay && <small>TODAY</small>}{holiday && <small className="holiday">{holiday}</small>}</span>
              {all.filter(item => item.date === key && item.id !== "sample-6").map(item => <span key={item.id} className={`event-chip ${item.category === "강의" ? "lecture" : item.category === "시험" ? "exam" : ""}`}>[{item.category}] {item.title}</span>)}
            </button>;
          })}</div>
        </>}
        <footer className="legend"><span>● 과제/할 일  <span>● 시험</span>  <b>● 강의</b></span><span>{monthEvents.length}건 등록</span></footer>
      </section>
      <section className="card day-card">
        <h2>{new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(toDate(selected))} {selected === sampleDay && <span className="pill solid">오늘</span>}</h2>
        <p>{selectedEvents.length}건의 일정이 등록되어 있습니다.</p>
        <div className="day-events">{selectedEvents.map(item => <article key={item.id} className={item.category === "강의" ? "lecture-event" : ""}>
          {item.category !== "강의" && <input type="checkbox" aria-label={item.title + " 완료"} checked={!!checked[item.id]} onChange={event => setChecked({ ...checked, [item.id]: event.target.checked })} />}
          <div><small className="event-meta"><span>{item.category === "강의" ? (item.id === "sample-6" ? "정규강의" : "실습강의") : item.category}</span>{item.time}</small><h3 className={checked[item.id] ? "done" : ""}>{item.title}</h3>{item.detail && <p>{item.category === "강의" && <Icon name="cal-3" />} {item.detail}</p>}</div>
        </article>)}</div>
        <form className="calendar-form" onSubmit={add}><input ref={input} value={title} onChange={event => setTitle(event.target.value)} placeholder="일정 이름 입력 후 Enter (예: 팀 미팅)" aria-label="일정 이름" required /><button className="soft purple"><Icon name="cal-6" /> 추가</button></form>
      </section>
    </div>
  </>;
}

const sampleExams = [
  { id: 1, name: "SQL 개발자 (SQLD) 제57회", short: "SQLD (SQL 개발자)", host: "한국데이터산업진흥원", kind: "IT/개발", range: "04.28 ~ 05.02 (마감)", date: "2025-05-31", result: "2025.06.27", due: "D-12", progress: 65, url: "https://www.dataq.or.kr/" },
  { id: 2, name: "TOEIC 제536회 정기시험", host: "YBM 한국TOEIC위원회", kind: "어학/외국어", range: "04.14 ~ 06.02 (접수중)", date: "2025-06-15", result: "2025.06.25", due: "D-27", url: "https://exam.toeic.co.kr/" },
  { id: 3, name: "정보처리기사 실기 2회", short: "정보처리기사 실기", host: "한국산업인력공단 (Q-Net)", kind: "IT/개발", range: "06.09 ~ 06.12", date: "2025-07-05", result: "2025.08.08", due: "D-45", progress: 20, url: "https://www.q-net.or.kr/" },
  { id: 4, name: "한국사능력검정시험 제71회", host: "국사편찬위원회", kind: "공통/기타", range: "07.08 ~ 07.15", date: "2025-08-09", result: "2025.08.22", due: "D-80" },
  { id: 5, name: "투자자산운용사 제39회", host: "금융투자협회", kind: "금융/경영", range: "07.21 ~ 07.25", date: "2025-08-17", result: "2025.08.28", due: "D-88" },
  { id: 6, name: "컴퓨터활용능력 1급", host: "대한상공회의소", kind: "국가기술", range: "상시 접수 가능", due: "상시 시험", progress: 40, url: "https://license.korcham.net/" },
];

export function Exams({ setEvents }) {
  const [exams, setExams] = useStoredState("planner-exams", sampleExams);
  const [favorites, setFavorites] = useStoredState("planner-favorites", [1, 3, 6]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("전체 일정");
  const [sort, setSort] = useState("마감순");
  const [form, setForm] = useState(null);
  const interest = exams.filter(exam => favorites.includes(exam.id)).sort((a, b) => sort === "이름순" ? a.name.localeCompare(b.name, "ko") : (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const shown = (tab === "전체 일정" ? exams.filter(exam => exam.date) : interest).filter(exam => (exam.name + exam.host).toLowerCase().includes(query.trim().toLowerCase()));

  function toggle(id) {
    setFavorites(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  }

  function linkExam(id, title, date) {
    setEvents(previous => previous.some(item => item.id === `exam-${id}`) ? previous : [...previous, { id: `exam-${id}`, title, date, category: "시험" }]);
    setForm(null);
  }

  function save(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (form.exam) {
      linkExam(form.exam.id, form.exam.name, fields.get("date"));
      return;
    }
    const name = fields.get("name").trim();
    if (!name) return;
    const id = crypto.randomUUID();
    setExams(previous => [...previous, { id, name, host: fields.get("host").trim(), date: fields.get("date"), kind: "개인", due: "예정", progress: 0 }]);
    setFavorites(previous => [...previous, id]);
    setForm(null);
  }

  function exportSchedule() {
    const content = ["종목,주관사,시험일", ...shown.map(exam => [exam.name, exam.host, exam.date ?? ""].map(value => '"' + String(value).replaceAll('"', '""') + '"').join(","))].join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-schedule.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return <>
    <header className="view-heading"><div><h1>자격증 시험 일정 <span className="pill">2025 상반기</span></h1><p>취업 및 졸업 요건 자격증 접수 및 시험일 관리</p></div>
      <div className="inline"><span className="card mini"><Icon name="exam-0" /> 관심 등록 <b>{favorites.length}</b></span><span className="card mini"><Icon name="exam-1" /> 이번 달 시험 <b>{exams.filter(exam => exam.date?.startsWith("2025-05")).length}</b></span><button className="primary" onClick={() => setForm({})}><Icon name="exam-2" /> 자격증 추가</button></div>
    </header>
    <div className="exams-tools"><Segments label="자격증 보기" options={["전체 일정", "관심 일정만 보기"]} selected={tab} onChange={setTab} /><input type="search" aria-label="자격증 검색" placeholder="⌕  자격증 명칭 또는 주관사 검색..." value={query} onChange={event => setQuery(event.target.value)} /></div>
    <div className="section-line"><h2>나의 관심 자격증 <span className="pill">{interest.length}건 진행 중</span></h2><select aria-label="관심 자격증 정렬" value={sort} onChange={event => setSort(event.target.value)}><option>마감순</option><option>이름순</option></select></div>
    <div className="three-columns">{interest.map(exam => <article key={exam.id} className="card exam-card">
      <div className="section-line"><small>{exam.host}</small><span className={`pill ${exam.id === 1 ? "red" : ""}`}>{exam.due}</span></div>
      <h3>{exam.short ?? exam.name}</h3>
      <div className="exam-detail"><div><span><Icon name="exam-4" /> 원서접수</span><span>{exam.id === 1 ? "접수 마감 완료" : exam.range ?? "미등록"}</span></div><div><span><Icon name={exam.date ? "exam-5" : "exam-8"} /> {exam.date ? "시험일" : "취득 상태"}</span><span>{exam.date?.replaceAll("-", ".") ?? "필기 합격 / 실기 준비 중"}</span></div></div>
      <div className="section-line"><small>{exam.date ? "학습 진도율" : "실기 연습량"}</small><strong>{exam.date ? (exam.progress ?? 0) + "%" : "기출 4/10회"}</strong></div>
      <Progress value={exam.progress ?? 0} />
      <div className="exam-actions"><button className="soft" onClick={() => setForm({ exam })}><Icon name="exam-6" /> 일정 연동</button>{exam.url && <a className="soft" href={exam.url} target="_blank" rel="noreferrer"><Icon name="exam-7" /> 공식 사이트</a>}</div>
    </article>)}</div>
    <div className="section-line table-heading"><div><h2>다가오는 주요 국가공인/어학 시험 일정</h2><p>2025년 5월 ~ 8월 주요 시험 접수 마감 및 시행일정</p></div><button className="card mini" onClick={exportSchedule}><Icon name="exam-9" /> 일정 내보내기</button></div>
    <div className="card table-wrap"><table><thead><tr>{["종목 / 회차", "구분", "원서 접수 기간", "시험일", "합격자 발표", "D-Day", "관리"].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{shown.map(exam => <tr key={exam.id}><td><h3>{exam.name}</h3><small>{exam.host}</small></td><td><span className="pill">{exam.kind}</span></td><td>{exam.range ?? "—"}</td><td>{exam.date?.replaceAll("-", ".") ?? "상시"}</td><td>{exam.result ?? "—"}</td><td><span className={`pill ${exam.id === 1 ? "red" : ""}`}>{exam.due}</span></td><td><button className="bookmark" aria-label={exam.name + " 관심 등록"} aria-pressed={favorites.includes(exam.id)} onClick={() => toggle(exam.id)}>{favorites.includes(exam.id) ? "★" : "☆"}</button></td></tr>)}</tbody></table>
      <footer>{shown.length ? `총 ${shown.length}개 자격증 일정` : "검색 조건에 맞는 일정이 없습니다."}</footer></div>
    {form && <div className="modal-backdrop" onClick={() => setForm(null)}><form className="card modal" role="dialog" aria-modal="true" aria-label={form.exam ? "일정 연동" : "자격증 추가"} onClick={event => event.stopPropagation()} onSubmit={save}>
      <h2>{form.exam ? form.exam.name + " 일정 연동" : "자격증 추가"}</h2>
      {!form.exam && <><label>자격증 이름<input name="name" required /></label><label>주관사<input name="host" /></label></>}
      <label>시험일<input name="date" type="date" defaultValue={form.exam?.date} required /></label>
      <div className="inline"><button type="button" className="soft" onClick={() => setForm(null)}>취소</button><button className="primary">{form.exam ? "캘린더에 추가" : "저장"}</button></div>
    </form></div>}
  </>;
}

function Progress({ value }) {
  return <progress max="100" value={value} aria-label={`진도 ${value}%`} />;
}
const prompts = ["과제 먼저 끝내기", "시험 대비에 더 집중하기", "주말 공부 계획 세우기"];
const chatTopics = ["오늘 할 일 우선순위 분석", "중간고사 D-14 컴퓨터구조 학습 플랜", "SQLD 자격증 준비 전략", "운영체제 팀프로젝트 마일스톤", "전공 학점 관리 시뮬레이션"];
const sampleChat = [
  { text: "이번 주 금요일에 컴퓨터구조 시험이 있고 내일까지 React 과제 제출해야 해. 오늘 2시간 정도 집중할 수 있는데 뭐부터 해야 할까?", time: "오후 6:42" },
  { text: "현재 마감일과 중요도를 종합했을 때, 당장 내일 마감인 React 과제의 핵심 컴포넌트를 먼저 1시간 20분 동안 완성하고, 남은 40분간 컴퓨터구조 1~2장 핵심 요약본을 복습하는 것을 추천합니다.", time: "오후 6:43", tasks: [["오늘 19:00 - 20:20", "80분", "React 팀 프로젝트 장바구니 로직 구현"], ["오늘 20:30 - 21:10", "40분", "컴퓨터구조 1장 명령어 세트 아키텍처 요약 읽기"]] },
  { text: "시험 비중을 좀 더 높여서 다시 짜줘", time: "오후 6:44" },
  { text: "시험 비중을 반영하여 일정을 재배치했습니다. 오늘 2시간을 1시간씩 균등 배분하여 React 과제 필수 기능 마감 및 컴퓨터구조 기출문제 풀이를 제안합니다.", time: "오후 6:44", tasks: [["오늘 19:00 - 20:00", "60분", "React 필수 상태 관리 및 버그 수정"], ["오늘 20:10 - 21:10", "60분", "컴퓨터구조 파이프라이닝 및 캐시 기출 10제 풀이"]] },
];

export function Chat() {
  const { todos, dispatch } = useContext(Context);
  const [threads, setThreads] = useStoredState("planner-chat", [{ id: 0, title: chatTopics[0], messages: sampleChat }, ...chatTopics.slice(1).map((title, i) => ({ id: i + 1, title, messages: [] }))]);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const scroll = useRef(null);
  const thread = threads.find(item => item.id === active);

  function send(text) {
    const request = text.trim();
    if (!request) return;
    const pending = todos.filter(todo => !todo.isCompleted).sort((a, b) => (b.priority ?? 85) - (a.priority ?? 85));
    const matching = pending.filter(todo => request.split(/\s+/).some(term => term.length > 1 && todo.task.toLowerCase().includes(term.toLowerCase())));
    const time = new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date());
    const tasks = (matching.length ? matching : pending).slice(0, 2).map((todo, i) => [i === 0 ? "먼저 집중하기" : "다음으로 진행하기", "25분", todo.task]);
    const reply = { text: tasks.length ? "등록된 할 일의 중요도와 요청 내용에 따라 다음 순서를 추천합니다. 한 항목에 25분씩 집중한 뒤 진행 상황을 확인해 보세요." : "진행 중인 할 일이 없습니다. 할 일 관리에서 공부할 과제나 시험 준비 항목을 추가해 주세요.", time, tasks };
    setThreads(previous => previous.map(item => item.id === active ? { ...item, title: item.title || request.slice(0, 32), messages: [...item.messages, { text: request, time }, reply] } : item));
    setDraft("");
    requestAnimationFrame(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; });
  }

  function newThread() {
    const id = crypto.randomUUID();
    setThreads(previous => [{ id, title: "", messages: [] }, ...previous]);
    switchThread(id);
  }

  function switchThread(id) {
    setActive(id);
    setDraft("");
    if (scroll.current) scroll.current.scrollTop = 0;
  }

  return <section className="card chat-shell">
    <aside className="chat-history">
      <button className="primary" onClick={newThread}><Icon name="chat-0" /> 새 대화 시작 <span>New</span></button>
      <p>최근 학업 플랜 대화</p>
      {threads.map(item => <button key={item.id} className="thread" aria-pressed={item.id === active} onClick={() => switchThread(item.id)}><Icon name={item.id === active ? "chat-1" : "chat-2"} />{item.title || "새 대화"}</button>)}
      <div className="chat-sync"><strong><Icon name="chat-3" /> 학습 데이터 연동</strong><p>등록된 {todos.length}개 할 일 데이터가 추천에 반영됩니다.</p></div>
    </aside>
    <div className="chat-main">
      <header><Icon name="chat-10" /><div><h2>AI 학업 어시스턴트</h2><p>대학생 맞춤 일정 & 할 일 최적화 엔진</p></div><span className="pill">플래너 추천</span></header>
      <div className="messages" ref={scroll}>
        {!thread?.messages.length && <p className="empty">학업 계획을 시작하려면 아래에 질문을 입력하세요.</p>}
        {thread?.messages.map((message, index) => <div key={index} className={`message ${message.tasks ? "assistant" : "user"}`}>
          <span className="avatar"><Icon name={message.tasks ? "chat-5" : "chat-4"} /></span>
          <div><div className="bubble"><p>{message.text}</p>
            {message.tasks?.map(([when, time, title]) => {
              const added = todos.some(todo => todo.task === title);
              return <article className="suggestion" key={title}><div><small>{when}  <span>{time}</span></small><h3>{title}</h3></div>
                <button className="soft" disabled={added} onClick={() => dispatch({ type: "ADD", payload: { id: crypto.randomUUID(), task: title, priority: 85, isCompleted: false } })}><Icon name="chat-6" /> {added ? "등록됨" : "할 일에 추가"}</button></article>;
            })}
            {index === 1 && <div className="prompts"><small>추천 탐색:</small>{prompts.map(prompt => <button className="pill" key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div>}
          </div><small className="timestamp">{message.time}</small></div>
        </div>)}
      </div>
      <form className="chat-form" onSubmit={event => { event.preventDefault(); send(draft); }}>
        <div><textarea rows="1" aria-label="메시지" placeholder="할 일, 과제 일정, 시험 준비 등 고민을 자유롭게 물어보세요..." value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); }
        }} /><button className="primary" aria-label="메시지 전송"><Icon name="chat-8" /></button></div>
        <small>Shift + Enter로 줄바꿈</small>
      </form>
    </div>
  </section>;
}

const designWeek = [2, 5, 3, 5, 3, 0, 0];

export function Stats({ navigate }) {
  const { todos, dispatch } = useContext(Context);
  const [offset, setOffset] = useState(0);
  const [report, setReport] = useState("주간 리포트");
  const actual = report === "내 학습 기록";
  const date = new Date();
  const monday = moveDay(date, -((date.getDay() + 6) % 7) + 7 * offset);
  const chart = actual ? Array.from({ length: 7 }, (_, i) => todos.filter(todo => todo.completedAt && dayKey(new Date(todo.completedAt)) === dayKey(moveDay(monday, i))).length) : offset === 0 ? designWeek : [2, 3, 2, 4, 2, 1, 0];
  const completed = chart.reduce((sum, value) => sum + value, 0);
  const total = actual ? completed + todos.filter(todo => !todo.isCompleted).length : 23;
  const percent = total ? Math.round(completed / total * 100) : 0;
  const focus = actual ? "—" : offset === 0 ? "24.5" : "19.5";
  const peak = Math.max(...chart, 1);
  const topDays = chart.flatMap((value, i) => value === peak ? [weekdays[(i + 1) % 7] + "요일"] : []);
  const metrics = [
    ["이번 주 완료율", percent + "%", actual ? "등록한 할 일 기준" : "지난주 대비 빠른 진척도", percent],
    ["완료한 할 일", completed, "남은 과제 " + (total - completed) + "개", percent, " / " + total + "개"],
    ["집중 학습 시간", focus, actual ? "집중 시간 기록 없음" : "일 평균 약 4.9시간 집중", actual ? 0 : 68, " 시간"],
  ];
  const mockTask = "SQLD 모의고사 1회분 풀기";
  return <>
    <header className="view-heading stats-heading"><div><small>● 학업 데이터 분석 보고서</small><h1>학습 및 할 일 통계</h1><p>한 주간의 학업 집중도 및 과제 이행 패턴을 점검하고 주말 목표를 수립하세요.</p></div>
      <div className="inline"><div className="card date-nav"><button aria-label="이전 주" onClick={() => setOffset(offset - 1)}><Icon name="cal-0" /></button><b>{actual ? `${monday.getMonth() + 1}월 ${monday.getDate()}일 주간` : offset === 0 ? "이번 주 (5월 3주차)" : `5월 3주차 ${offset > 0 ? "+" : ""}${offset}주`}</b><button aria-label="다음 주" onClick={() => setOffset(offset + 1)}><Icon name="cal-1" /></button></div>
      <select className="card mini" aria-label="리포트 선택" value={report} onChange={event => setReport(event.target.value)}><option>주간 리포트</option><option>내 학습 기록</option></select></div>
    </header>
    <div className="three-columns metrics">{metrics.map(([label, value, description, progress, unit], i) => <article className="card metric" key={label}><div className="section-line"><p>{label}</p><span className="stat-icon"><Icon name={`stats-${[2, 4, 5][i]}`} /></span></div>
      <strong>{value}</strong>{unit && <span>{unit}</span>}{!actual && offset === 0 && i === 0 && <span className="pill"><Icon name="stats-3" /> +12%</span>}<p>{description}</p><Progress value={progress} /></article>)}</div>
    <section className="card chart"><div className="section-line"><div><h2>요일별 완료 추이</h2><p>일자별 완료된 태스크 수량 및 학습 집중 추이</p></div><small>🟣 완료한 할 일  ● 진행 예정</small></div>
      <div className="bars" aria-label="요일별 완료한 할 일 수">{chart.map((value, i) => <div className="bar-slot" key={i}><span>{value ? value + "개" : !actual && i === 5 ? "1개" : "–"}</span><div className={`bar ${value === peak ? "peak" : ""} ${!value ? "planned" : ""}`} style={{ height: value ? `${value / peak * 74}%` : !actual && i === 5 ? "17%" : "6%" }} /><small>{weekdays[(i + 1) % 7]}</small></div>)}</div>
      <footer className="section-line"><p>{topDays.length ? `최고 생산 요일: ${topDays.join(", ")} (각 ${peak}개 완료)` : "완료한 할 일이 없습니다."}</p>{!actual && offset === 0 && <strong>전주 평균 대비 +35% 향상</strong>}</footer>
    </section>
    <div className="section-line insights-heading"><h2>학습 인사이트</h2><small>AI 플래너 요약</small></div>
    <div className="insights">
      <article className="card"><span className="stat-icon"><Icon name="stats-6" /></span><div><h3>요일별 집중 패턴 발견</h3><p>{topDays.length ? `${topDays.join(", ")}에 완료한 할 일이 가장 많았습니다.` : "할 일을 완료하면 요일별 패턴을 확인할 수 있습니다."}</p><p>다음 주에는 집중하기 쉬운 요일에 주요 전공 과제를 배치해 보세요.</p></div></article>
      <article className="card"><span className="stat-icon"><Icon name="stats-7" /></span><div><h3>목표 완주 가이드</h3><p>이번 주말(토~일) SQLD 모의고사 1회분을 추가해 학습 목표를 점검해 보세요.</p><div className="section-line"><p>예상 소요 시간: 약 90분</p><button onClick={() => {
        if (!todos.some(todo => todo.task === mockTask)) dispatch({ type: "ADD", payload: { id: crypto.randomUUID(), task: mockTask, priority: 85, isCompleted: false } });
        navigate("tasks");
      }}>할 일 등록 →</button></div></div></article>
    </div>
  </>;
}
