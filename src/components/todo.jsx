import { useContext} from "react"
import { Context } from "../components/context/context"

export function TodosList() {

    const {todos, dispatch, filter} = useContext(Context)

    const visibleTodos = todos.filter(todo => {
        if (filter === "active") return !todo.isCompleted
        if (filter === "completed") return todo.isCompleted

        return true
    })

    if (visibleTodos.length === 0) {
        return <ul className="todos__list"><li className="empty-msg">{"No items"}</li></ul>
    }

    return (
        <ul className="todos__list">
            {visibleTodos.map(todo => (
                <li key={todo.id} className="todos__item">
                    <span onClick={() => dispatch({type: "TOGGLE", payload: todo.id})}>
                        {todo.isCompleted ? "☑" : "☐"}
                    </span>

                    <h2 className={todo.isCompleted ? "completed" : ""}>{todo.task}</h2>
                    <button onClick={() => dispatch({type: "DELETE", payload: todo.id})}>Delete</button>
                </li>
            ))}
        
        </ul>
    )
}

export function TodosCount() {
    const {todos} = useContext(Context)
    return <span>{`Remaining Todos: ${todos.filter(todo => !todo.isCompleted).length} `}</span>
}

export function TodosSection({children}) {
    return(
        <section className="todos">
            {children}
        </section>
    )
}