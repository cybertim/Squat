import { Controller, Directive, Route, Switcher } from "./Interfaces.ts";
import { Sqope } from "./Sqope.ts";

export class Provider {

    private static _instance: Provider;
    private _directives: Map<string, Directive> = new Map();
    private _controller: Map<string, Controller> = new Map();
    private _routes: Map<string, string> = new Map();
    private _scopes: Map<string, Sqope> = new Map();
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
            this._controller.set(ctrl.constructor.name, ctrl);
        }
    }

    public getController(id: string) {
        return this._controller.get(id);
    }

    public setDirectives(directives: Directive[]) {
        for (const directive of directives) {
            this._directives.set(directive.name, directive);
        }
    }

    public getDirectives(name: string) {
        return this._directives.get(name.toLowerCase());
    }

    public pushPage(path: string) {
        const controller = this.getControllerByRoute(path);
        if (controller && this._router && this._switcher) {
            this._pageStack.unshift(path);
            this._switcher.pushPage(this._router, path, controller);
        }
        else console.error("no route or controller for path '" + path + "'.");
    }

    public popPage() {
        if (this._pageStack.length < 1) return;
        this._pageStack.shift();
        const path = this._pageStack[0];
        if (path) {
            const controller = this.getControllerByRoute(path);
            if (controller && this._router && this._switcher)
                this._switcher.popPage(this._router, path, controller);
        }
    }

    public getSqope(name?: string) {
        let root = this._scopes.get('root');
        if (!root) root = new Sqope();
        if (name) {
            let sqope = this._scopes.get(name);
            if (!sqope) {
                sqope = root.new();
                this._scopes.set(name, sqope);
            }
            return sqope;
        } else return root;
    }

}
