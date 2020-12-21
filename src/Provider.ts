import { Switcher } from "./Compiler.ts";
import { Scope } from "./Scope.ts";

export type Directive = {
    scope: boolean;
    link: (elem: HTMLElement, scope: Scope, action: string) => void;
};

export class Controller {
    public template: string | undefined;
    initialize(scope: Scope) { }
};

export class Provider {
    private static _instance: Provider;
    private _directives: Record<string, Directive> = {};
    private _controller: Record<string, Controller> = {};
    private _routes: Record<string, string> = {};
    private _root = new Scope();
    private _route: Element;
    private _switcher: Switcher | undefined;

    public static instance() {
        if (!Provider._instance) {
            Provider._instance = new Provider();
        }
        return Provider._instance;
    }

    setRouteElement(element: Element) {
        this._route = element;
    }

    setRouteSwitcher(switcher: Switcher) {
        this._switcher = switcher;
    }

    setRoutes(routes: Record<string, string>) {
        for (const route in routes) {
            console.debug("adding route", routes[route].toLowerCase());
            this._routes[route] = routes[route].toLowerCase();
        }
    }

    getControllerByRoute(name: string) {
        const id = this._routes[name.toLowerCase()];
        if (id) return this.getController(id);
    }

    setControllers(controllers: Controller[]) {
        for (const ctrl of controllers) {
            console.debug("adding controller", ctrl.constructor.name.toLowerCase());
            this._controller[ctrl.constructor.name.toLowerCase()] = ctrl;
        }
    }

    public getController(id: string) {
        return this._controller[id.toLowerCase()];
    }

    public setDirectives(directives: Record<string, Directive>) {
        this._directives = directives;
    }

    public getDirectives(name: string) {
        return this._directives[name.toLowerCase()];
    }

    public navigate(scope: Scope, path: string) {
        const id = this._routes[path];
        if (id) {
            const controller = this.getController(id);
            if (controller && this._route && this._switcher) {
                //scope.destroy();
                // TODO: fix scope for routes / controllers
                this._switcher(this._route, path, controller);
            }
            else console.error("Router root element not set and/or controller '" + id + "' was not declared or set.");
        }
    }

    public root() {
        return this._root;
    }

}
