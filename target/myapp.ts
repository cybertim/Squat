import { Squat } from "../src/Squat.ts";
import { Provider } from "../src/Provider.ts";
import { Scope } from "../src/Scope.ts";
import { Controller } from "../src/Interfaces.ts";
import { OnsenUISwitcher } from "../src/xtr/OnsenUISwitcher.ts";
import { SqtBind } from "../src/std/SqtBind.ts";
import { SqtRepeat } from "../src/std/SqtRepeat.ts";
import { SqtClick } from "../src/std/SqtClick.ts";
import { SqtModel } from "../src/std/SqtModel.ts";
import { SqtRouter } from "../src/std/SqtRouter.ts";

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
            Provider.instance().pushPage(scope, "/page2");
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
        Provider.instance().popPage(scope);
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
            Provider.instance().pushPage(scope, "/page2");
        }
    }

}

class OnsenPage2 extends Controller {
    template = `
    <ons-page id="page2">
    <ons-toolbar>
      <div class="left">
      <ons-toolbar-button sqt-click="terug()">
       back
      </ons-toolbar-button>
      </div>
      <div class="center"></div>
    </ons-toolbar>

    <p>This is the second page.</p>
  </ons-page>
    `
    initialize(scope: Scope) {
        scope.model['terug()'] = (scope: Scope) => {
            Provider.instance().popPage(scope);
        }
    }

}

Squat.bootstrap({
    controllers: [
        new OnsenPage1(),
        new OnsenPage2()
    ],
    routes: [
        { path: "/", controllerName: OnsenPage1.name },
        { path: "/page2", controllerName: OnsenPage2.name }
    ],
    directives: [SqtBind, SqtRepeat, SqtClick, SqtModel, SqtRouter],
    switcher: new OnsenUISwitcher()
});
