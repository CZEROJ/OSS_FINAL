import {createContext, useReducer, useState} from "react";

export const Context = createContext()

export function ContextProvider({children}) {

    function reducer(todos, action) {
        if (action.type === "ADD") {
            return [...todos, action.payload]
        }
        
        if (action.type === "DELETE") {
            return todos.filter(todo => todo.id !== action.payload)
        }

        if (action.type === "TOGGLE") {
            return todos.map(todo =>
                todo.id === action.payload? {... todo, isCompleted: !todo.isCompleted} : todo
            )
        }
        
        return todos
    }

    const initialState = [
            { id: 1, task:"Complete Homework", isCompleted: false },
            { id: 2, task:"Exercise for 30mins", isCompleted: false }
        ];
    const [todos, dispatch] = useReducer(reducer, initialState)

    const [filter, setFilter] = useState("all");

    return (
        <Context.Provider value={{todos, dispatch, filter, setFilter}}>
            {children}
        </Context.Provider>
    )
}