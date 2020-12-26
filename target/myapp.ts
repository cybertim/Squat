import { Squat } from "../src/Squat.ts";
import { Provider } from "../src/Provider.ts";
import { Controller, Model } from "../src/Interfaces.ts";
import { OnsenUISwitcher } from "../src/xtr/OnsenUISwitcher.ts";
import { SqtBind } from "../src/std/SqtBind.ts";
import { SqtSwitcher } from "../src/std/SqtSwitcher.ts";
import { SqtRepeat } from "../src/std/SqtRepeat.ts";
import { SqtClick } from "../src/std/SqtClick.ts";
import { SqtModel } from "../src/std/SqtModel.ts";
import { SqtRouter } from "../src/std/SqtRouter.ts";
import { Sqope } from "../src/Sqope.ts";

type Todo = {
    description: string;
    priority: number;
}

type Todos = { list: Todo[] }

@Model({
    template: `
    <ons-page>
    <ons-toolbar>
      <div class="center">Page 1</div>
    </ons-toolbar>

    <section>
    <span sqt-bind="bar"></span>
    <input sqt-model="bar" type="text">
    <ons-button sqt-click="foo">Increment</ons-button>
</section>

<section>
    <input type="text" sqt-model="todo.description">
    <input type="number" sqt-model="todo.priority">
    <ons-button sqt-click="add">Add</ons-button>

    <table>
        <tr sqt-repeat="todo in todos.list">
            <td>
                <ons-button sqt-click="delete">delete</ons-button>
            </td>
            <td sqt-bind="todo.description"></td>
            <td sqt-bind="todo.priority"></td>
        </tr>
    </table>
</section>
</ons-page>`
})
class MainCtrl extends Controller {

    bar = "";

    todo: Todo = {
        description: "",
        priority: 0
    }

    todos: Todos = {
        list: []
    }

    foo = (sqope: Sqope) => {
        Provider.instance().pushPage("/page2");
    }

    add = (scope: Sqope) => {
        if (this.todo && this.todos) {
            this.todos.list.push({
                description: this.todo.description,
                priority: this.todo.priority
            });
        }
    }

    delete = (sqope: Sqope) => {
        if (sqope.controller && !(sqope.controller instanceof Controller)) {
            const todo = <Todo>sqope.controller["todo"]; // now we get the todo:)
            console.debug("delete", todo.description);
        }
    }

    sqtInit = (sqope: Sqope) => {

    };
}

@Model({
    template: `
        <ons-page>
    <ons-toolbar>
          <div class="left">
      <ons-toolbar-button sqt-click="back">
       back
      </ons-toolbar-button>
      </div>
      <div class="center">Page 2</div>
    </ons-toolbar>

    <input sqt-model="bar" type="text">
    <ons-button sqt-click="foo">TEst</ons-button>
    <span sqt-bind="bar"></span>
    </ons-page>`

})
class SecondCtrl extends Controller {
    bar = "abc"
    back = (sqope: Sqope) => {
        // console.log(this.bar);
        Provider.instance().popPage();
    }
    foo = (sqope: Sqope) => {
        console.debug(this.bar);
    }
    sqtInit = (sqope: Sqope) => {

    };

}

Squat.bootstrap({
    controllers: [
        new MainCtrl(),
        new SecondCtrl()
    ],
    routes: [
        { path: "/", controllerName: MainCtrl.name },
        { path: "/page2", controllerName: SecondCtrl.name }
    ],
    directives: [SqtBind, SqtRepeat, SqtClick, SqtModel, SqtRouter],
    switcher: new OnsenUISwitcher()
});
