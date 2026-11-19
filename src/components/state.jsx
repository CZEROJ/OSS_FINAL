import { useContext} from "react";
import { Context } from "../components/context/context";

export function ButtonGroup() {

    const {setFilter} = useContext(Context)
    return (
        <div className="btns">
            <button onClick={() => setFilter("all")}>All</button>
            <button onClick={() => setFilter("active")}>Active</button>
            <button onClick={() => setFilter("completed")}>Completed</button>
        </div>
        
    )
}
