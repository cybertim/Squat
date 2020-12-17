import { Compiler } from "../lib/Compiler.ts";
import { Provider } from "../lib/Provider.ts";
import { Scope } from "../lib/Scope.ts";

Provider.instance().controller("MainCtrl", (scope) => {

    class Todo {
        description = "";
        priority = 0;
    }

    const todo = new Todo();
    scope.model['todo'] = todo; // add to model

    class Todos {
        list: Todo[] = [];
    }

    const todos = new Todos();
    scope.model['todos'] = todos;

    scope.model['foo()'] = (scope: Scope) => {
        console.log("clicked");
    }

    scope.model['add()'] = (scope: Scope) => {
        if (todo && todos) {
            todos.list.push({
                description: todo.description,
                priority: todo.priority
            });
        }
    }

    scope.model['delete()'] = (scope: Scope) => {
        const todo = <Todo>scope.get('todo'); // local todo from scope (nested repeat)
        console.log(todos.list.indexOf(todo));
    }

});

Compiler.bootstrap();