import TodoHeader from "./components/todoHeader";

import {ButtonGroup} from "./components/state";

import {TodosCount, TodosList, TodosSection} from "./components/todo";
import {ContextProvider } from "./components/context/context";

export default function App() {

    

    return(
        <ContextProvider>
            <TodosSection>
                <TodoHeader/>

                <TodosList />
                <ButtonGroup/>
                <TodosCount />
            </TodosSection>
        </ContextProvider>

    )
}
