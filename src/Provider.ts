import { Controller, Directive, Route, Switcher } from "./Interfaces.ts";
import { Scope } from "./Scope.ts";

export class Provider {

    private static _instance: Provider;
    private _directives: Map<string, Directive> = new Map();
    private _controller: Record<string, Controller> = {};
    private _routes: Map<string, string> = new Map();
    private _scopes: Record<string, Scope> = { root: new Scope() };
    private _router: Element | undefined;
    private _switcher: Switcher | undefined;
    private _pageStack: Array<string> = [];

    public static instance() {
        if (!Provider._instance) {
            Provider._instance = new Provider();
        }
        return Provider._instance;
    }

    setRouterElement(element: Element) {
        this._router = element;
    }

    setRouteSwitcher(switcher: Switcher) {
        this._switcher = switcher;
    }

    setRoutes(routes: Route[]) {
        for (const route of routes) {
            this._routes.set(route.path, route.controllerName.toLowerCase());
        }
    }

    getControllerByRoute(name: string) {
        const id = this._routes.get(name.toLowerCase());
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

    public setDirectives(directives: Directive[]) {
        for (const directive of directives) {
            this._directives.set(directive.name, directive);
        }
    }

    public getDirectives(name: string) {
        return this._directives.get(name.toLowerCase());
    }

    public pushPage(scope: Scope, path: string) {
        const controller = this.getControllerByRoute(path);
        if (controller && this._router && this._switcher) {
            this._pageStack.unshift(path);
            this._switcher.pushPage(this._router, path, controller);
        }
        else console.error("no route or controller for path '" + path + "'.");
    }

    public popPage(scope: Scope) {
        if (this._pageStack.length < 1) return;
        this._pageStack.shift();
        const path = this._pageStack[0];
        if (path) {
            const controller = this.getControllerByRoute(path);
            if (controller && this._router && this._switcher)
                this._switcher.popPage(this._router, path, controller);
        }
    }

    public getScope(name?: string) {
        const root = this._scopes['root'];
        if (name) {
            let scope = this._scopes[name];
            if (!scope) {
                scope = root.new();
                this._scopes[name] = scope;
            }
            return scope;
        } else return root;
    }

}
