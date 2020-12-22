import { Compiler, Switcher } from "./Compiler.ts";
import { Controller, Directive, Provider } from "./Provider.ts";
import { Scope } from "./Scope.ts";

export class OnsenUISwitcher extends Switcher {

    initialize(element: Element): void {
        const loader = (options: { page: string | Element, parent: Element }, done: (elem: Element | null | undefined) => void) => {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = "" + Provider.instance().getController(<string>options.page).template;//"" + controller.template;
            options.page = wrapper.children[0];
            options.parent.appendChild(options.page);
            done(options.page);
        };

        const unloader = (page: Element) => {
            page.remove();
        }

        (<ons.OnsNavigatorElement>element).pageLoader = new ons.PageLoader(loader, unloader);
    }

    _pushPage(element: Element, path: string, controller: Controller): void {
        if (controller.template) {
            (<ons.OnsNavigatorElement>element).pushPage(controller.constructor.name, {
                callback: () => { OnsenUISwitcher.callback(element, path, controller) }
            });
        }
    }

    _popPage(element: Element, path: string, controller: Controller) {
        if (controller.template) {
            console.debug("triggered.");
            (<ons.OnsNavigatorElement>element).popPage({
                callback: () => { OnsenUISwitcher.callback(element, path, controller) }
            });
        }
    }

    static callback(element: Element, path: string, controller: Controller) {
        console.debug("callback");
        Compiler.finish(element, path, controller);
    }
}

export class StdSwitcher extends Switcher {
    initialize(element: Element): void {
        console.log("Switcher is ready.");
    }

    _pushPage(element: Element, path: string, controller: Controller): void {
        this.goTo(element, path, controller);
    }

    _popPage(element: Element, path: string, controller: Controller): void {
        this.goTo(element, path, controller);
    }

    goTo(element: Element, path: string, controller: Controller): void {
        if (controller.template) {
            element.innerHTML = controller.template;
            Compiler.finish(element, path, controller);
        } else console.error("No template set on controller at path", path);
    }
}

export const stdDirectives: Record<string, Directive> = {

    "sqt-router": {
        scope: false,
        link: (elem, scope, act) => {
            Provider.instance().setRouteElement(elem);
            // TODO: use the 'act' for default path to visit?
            Provider.instance().pushPage(scope, "/");
        }
    },

    "sqt-repeat": {
        scope: false,
        link: (elem, scope, act) => {
            let scopes: Scope[] = [];

            const parts = act.split('in');
            const collectionName = parts[1].trim();
            const itemName = parts[0].trim();
            const parentNode = elem.parentNode;

            const render = (obj: unknown) => {

                while (parentNode && parentNode.firstChild) {
                    parentNode.removeChild(parentNode.firstChild);
                }

                for (let i = 0; i < scopes.length; i++)scopes[i].destroy();
                scopes = [];

                const v = obj;//scope.get(collectionName);
                if (Array.isArray(v)) {
                    for (const e of v) {
                        const currentNode = <Element>elem.cloneNode(true);
                        currentNode.removeAttribute('sqt-repeat');
                        const s = scope.new();
                        scopes.push(s);
                        s.model[itemName] = e;
                        if (parentNode) parentNode.appendChild(currentNode);
                        Compiler.compile(currentNode, s);
                    }
                }

            }

            scope.subscribe({
                name: collectionName,
                callback: (obj) => {
                    if (obj) render(obj);
                }
            });

            const obj = scope.get(collectionName);
            if (obj) render(obj);
        }
    },

    "sqt-bind": {
        scope: false,
        link: (elem, scope, act) => {

            scope.subscribe({
                name: act,
                callback: (obj) => {
                    if (obj && typeof obj === 'string') elem.innerHTML = obj;
                }
            });

            const val = scope.get(act);
            if (typeof val === 'string') elem.innerHTML = val;
        }
    },

    "sqt-click": {
        scope: false,
        link: (elem, scope, act) => {
            elem.onclick = (e) => {
                scope.exec(act);
                scope.digest();
            };
        }
    },

    "sqt-model": {
        scope: false,
        link: (elem, scope, act) => {
            if (elem instanceof HTMLInputElement) {

                elem.onkeyup = (e) => {
                    scope.set(act, elem.value)
                    scope.digest();
                };

                scope.subscribe({
                    name: act,
                    callback: (obj) => {
                        if (obj && typeof obj === 'string') elem.value = obj;
                    }
                });
            }
        }
    }

};
