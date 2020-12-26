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

@Model({
    template: `

    <nav class="navbar sticky-top navbar-dark bg-dark">
        <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">Demo</span>
        </div>
    </nav>
    
    <div class="container">
    
        <div>
            <form>
                <div class="mb-3">
                    <label for="usernameInput" class="form-label">Username</label>
                    <input sqt-model="username" type="text" class="form-control" id="usernameInput">
                </div>
                <div class="mb-3">
                    <label for="passwordInput" class="form-label">Password</label>
                    <input sqt-model="password" type="password" class="form-control">
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input">
                    <label class="form-check-label">Check me out</label>
                </div>
    
                <div class="d-grid gap-2">
                    <button sqt-click="add" class="btn btn-primary" type="button">Button</button>
                </div>
            </form>
        </div>
    
        <div sqt-repeat="item in items" class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text" sqt-bind="item"></p>
                <div class="d-grid gap-2">
                    <button sqt-click="delete" class="btn btn-primary">Go somewhere</a>
                </div>
            </div>
        </div>
    </div>
    `
})
class MainCtrl extends Controller {

    username = "";
    password = "";
    items = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

    add = (sqope: Sqope) => {
        this.items.push(this.username);
    }

    foo = (sqope: Sqope) => {
        Provider.instance().pushPage("/page2");
    }

    delete = (sqope: Sqope) => {
        if (sqope.controller && !(sqope.controller instanceof Controller)) {
            const txt = <string>sqope.controller["item"]; // now we get the todo:)
            console.debug("delete", txt);
        }
    }

    sqtInit = (sqope: Sqope) => { };
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
    switcher: new SqtSwitcher()
});
