import { Compiler, raw } from "../src/Compiler.ts";
import { Provider } from "../src/Provider.ts";
import { Scope } from "../src/Scope.ts";
import ons from "../lib/onsenui.d.ts";

Provider.instance().controller("MainCtrl", {
    template: raw`
    <section>
        <span sqt-bind="bar"></span>
        <input sqt-model="bar" type="text">
        <ons-button sqt-click="foo()">Increment</ons-button>
    </section>
    
    <section>
        <input type="text" sqt-model="todo.description">
        <input type="number" sqt-model="todo.priority">
        <ons-button sqt-click="add()">Add</ons-button>
    
        <table>
            <tr sqt-repeat="todo in todos.list">
                <td>
                    <ons-button sqt-click="delete()">delete</ons-button>
                </td>
                <td sqt-bind="todo.description"></td>
                <td sqt-bind="todo.priority"></td>
            </tr>
        </table>
    </section>
    `,
    controller: (scope) => {

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
            ons.notification.alert("asd");
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

    }
});

Compiler.bootstrap();