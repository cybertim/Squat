import { Compiler } from "./Compiler.ts";
import { Controller, Provider } from "./Provider.ts";
import { Scope } from "./Scope.ts";

type RouteSwitcher = (element: Element, path: string, controller: Controller) => void;

export class Router {

    private static _instance: Router;
    private _root: Element;
    private _routes: Map<string, string> = new Map();
    private _switcher: RouteSwitcher;

    static instance() {
        if (!Router._instance) {
            Router._instance = new Router();
        }
        return Router._instance;
    }

    constructor() {
        this._switcher = this.defaultSwitcher();
    }

    setRoot(elem: Element) {
        this._root = elem;
    }

    setSwitcher(switcher: RouteSwitcher) {
        this._switcher = switcher;
    }

    private defaultSwitcher(): RouteSwitcher {
        return (element, path, controller) => {
            element.innerHTML = controller.template;
            controller.controller(Provider.instance().root());
            if (!Compiler.busy) {
                for (let i = 0; i < element.children.length; i++)
                    Compiler.compile(element.children[i], Provider.instance().root());
            }
        }
    }

    route(path: string, controllerId: string) {
        this._routes.set(path, controllerId);
    }

    navigate(scope: Scope, path: string) {
        const controllerId = this._routes.get(path);
        if (controllerId) {
            const controller = Provider.instance().getController(controllerId);
            if (controller && this._root) {
                //scope.destroy();
                this._switcher(this._root, path, controller);
            }
            else console.error("Router root element not set and/or controller '" + controllerId + "' was not declared or set.");
        }
    }
}