import { Compiler } from "../lib/Compiler.ts";
import { SQTObject } from "../lib/Interfaces.ts";
import { Provider } from "../lib/Provider.ts";

Provider.instance().controller("MainCtrl", (scope) => {

    class Todo extends SQTObject {
        description = "";
        priority = 0;
    }

    scope.setObject("todo", new Todo());

    class Todos extends SQTObject {
        list: Todo[] = [];
    }

    scope.setObject("todos", new Todos());

    scope.setAction("foo()", (obj) => {
        console.log("clicked");
    });

    scope.setAction("add()", (obj) => {
        const todos = scope.getObject<Todos>("todos");
        const todo = scope.getObject<Todo>("todo");
        if (todos && todo) {
            todos.list.push({
                description: todo.description,
                priority: todo.priority
            });
            scope.setObject("todos", todos);
        }
    });

});

Compiler.bootstrap();