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
</section>`
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
        console.log(sqope);
    }

    sqtInit = (sqope: Sqope) => {

    };
}

@Model({
    template: `
    <input sqt-model="bar" type="text">
    <ons-button sqt-click="foo">TEst</ons-button>
    <span sqt-bind="bar"></span>`

})
class SecondCtrl extends Controller {
    bar = "abc"
    foo = (sqope: Sqope) => {
        // console.log(this.bar);
        Provider.instance().popPage();
    }

    sqtInit = (sqope: Sqope) => {

    };

}

// class OnsenPage1 extends Controller {
//     template = `
//     <ons-page id="page1">
//     <ons-toolbar>
//       <div class="center">Page 1</div>
//     </ons-toolbar>

//     <p>This is the first page.</p>

//     <ons-button id="push-button" sqt-click="go()">Push page</ons-button>
//   </ons-page>
//     `
//     initialize(scope: Scope) {
//         scope.model['go()'] = (scope: Scope) => {
//             Provider.instance().pushPage(scope, "/page2");
//         }
//     }

// }

// class OnsenPage2 extends Controller {
//     template = `
//     <ons-page id="page2">
//     <ons-toolbar>
//       <div class="left">
//       <ons-toolbar-button sqt-click="terug()">
//        back
//       </ons-toolbar-button>
//       </div>
//       <div class="center"></div>
//     </ons-toolbar>

//     <p>This is the second page.</p>
//   </ons-page>
//     `
//     initialize(scope: Scope) {
//         scope.model['terug()'] = (scope: Scope) => {
//             Provider.instance().popPage(scope);
//         }
//     }

// }

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
    switcher: new SqtSwitcher()
});
