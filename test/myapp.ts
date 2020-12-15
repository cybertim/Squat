import { Compiler } from "../lib/Compiler.ts";
import { Provider } from "../lib/Provider.ts";
import { Scope } from "../lib/Scope.ts";

Provider.instance().directive("sqt-repeat", {
    scope: false,
    link: (elem, scope, act) => {
        let scopes: Scope[] = [];
        const parts = act.split('in');
        const collectionName = parts[1].trim();
        const itemName = parts[0].trim();
        const parentNode = elem.parentNode;

        const render = (val: string[]) => {
            var els = val;
            var currentNode;
            var s;
            while (parentNode && parentNode.firstChild) {
                parentNode.removeChild(parentNode.firstChild);
            }
            scopes.forEach((s) => {
                s.destroy();
            });
            scopes = [];
            els.forEach((val) => {
                currentNode = <Element>elem.cloneNode();
                currentNode.removeAttribute('sqt-repeat');
                currentNode.removeAttribute('sqt-scope');
                s = scope.new();
                scopes.push(s);
                s.value(itemName, val);
                Compiler.compile(currentNode, s);
                if (parentNode) parentNode.appendChild(currentNode);
            });
        }
        scope.watch({
            act: collectionName,
            fn: (z) => {
                const v = scope.values.get(collectionName);
                if (v && Array.isArray(v)) render(v);
            }
        });
        const v = scope.values.get(collectionName);
        if (v && Array.isArray(v)) render(v);
    }
})

Provider.instance().directive("sqt-controller", {
    scope: false,
    link: (elem, scope, act) => {
        Provider.instance().invoke(act);
    }
});

Provider.instance().directive("sqt-bind", {
    scope: false,
    link: (elem, scope, act) => {
        elem.innerHTML = scope.exec(act) || "";
        scope.watch({
            act: act,
            fn: (val) => {
                if (!Array.isArray(val)) elem.innerHTML = val;
            }
        });
    }
})

Provider.instance().directive("sqt-click", {
    scope: false,
    link: (elem, scope, act) => {
        elem.onclick = () => {
            scope.exec(act);
            scope.digest();
        };
    }
})

Provider.instance().directive("sqt-model", {
    scope: false,
    link: (elem, scope, act) => {
        if (elem instanceof HTMLInputElement) {
            elem.onkeyup = () => {
                scope.value(act, elem.value);
                scope.digest();
            };
            scope.watch({
                act: act,
                fn: (value) => {
                    if (!Array.isArray(value)) elem.value = value;
                }
            });
        }
    }
});

Provider.instance().controller("MainCtrl", (scope) => {

    scope.action("foo", (scope) => {
        console.log("clicked");
    });

    scope.action("add()", (scope) => {
        const todos = <string[]>scope.values.get("todos") || [];
        const todo = <string>scope.values.get("todos") || "empty";
        todos.push(todo)
        scope.value("todos", todos);
    });

});

Compiler.bootstrap();