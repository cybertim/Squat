import { Compiler } from "../src/Compiler.ts";
import { Controller, Provider } from "../src/Provider.ts";
import { Scope } from "../src/Scope.ts";
import { stdDirectives, stdSwitcher } from "../src/Std.ts";
import ons from "../lib/onsenui.d.ts";

class MainCtrl extends Controller {
    template = `
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
    `

    initialize(scope: Scope) {

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
            //ons.notification.alert("asd");
            Provider.instance().navigate(scope, "/page2");
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
}

class SecondCtrl extends Controller {
    template = `
    <input sqt-model="bar" type="text">
    <ons-button sqt-click="bar()">TEst</ons-button>
    <span sqt-bind="bar"></span>`

    initialize(scope: Scope) {
        scope.model["bar"] = "this.abc";
        scope.model["bar()"] = this.bar;
    }

    bar(scope: Scope) {
        Provider.instance().navigate(scope, "/");
        //console.log("bar is", this.abc);
    }
}

class OnsenPage1 extends Controller {
    template = `
    <ons-page id="page1">
    <ons-toolbar>
      <div class="center">Page 1</div>
    </ons-toolbar>

    <p>This is the first page.</p>

    <ons-button id="push-button" sqt-click="go()">Push page</ons-button>
  </ons-page>
    `
    initialize(scope: Scope) {
        scope.model['go()'] = (scope: Scope) => {
            Provider.instance().navigate(scope, "/page2");
        }
    }

}

class OnsenPage2 extends Controller {
    template = `
    <ons-page id="page2">
    <ons-toolbar>
      <div class="left"><ons-back-button>Page 1</ons-back-button></div>
      <div class="center"></div>
    </ons-toolbar>

    <p>This is the second page.</p>
  </ons-page>
    `
    initialize(scope: Scope) { }

}

Compiler.bootstrap({
    controllers: [
        new MainCtrl(),
        new SecondCtrl()
    ],
    routes: {
        "/": MainCtrl.name,
        "/page2": SecondCtrl.name
    },
    directives: stdDirectives,
    switcher: stdSwitcher
});
