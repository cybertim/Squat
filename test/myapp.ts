import { DOMCompiler } from "../lib/DOMCompiler.ts";
import { Provider } from "../lib/Provider.ts";

Provider.instance().directive("sqt-bind", {
    scope: false,
    link: (elem, scope, expr) => {
        console.log("im triggered " + expr);
        elem.innerHTML = scope.eval(expr);
        scope.watch({
            exp: expr,
            fn: (val) => {
                elem.innerHTML = val;
            },
            last: expr
        });
    }
})

Provider.instance().directive("sqt-click", {
    scope: false,
    link: (elem, scope, expr) => {
        console.log("im triggered " + expr);
        elem.onclick = () => {
            scope.eval(expr);
            scope.digest();
        };
    }
})

Provider.instance().controller("MainCtrl", (scope) => {
});

DOMCompiler.bootstrap();