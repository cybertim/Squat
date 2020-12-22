import { Switcher } from "./Compiler.ts";
import { Scope } from "./Scope.ts";

export type Directive = {
    scope: boolean;
    link: (elem: HTMLElement, scope: Scope, action: string) => void;
};

export abstract class Controller {
    protected initialized = false;
    abstract template: string | undefined;
    abstract initialize(scope: Scope): void;
    doInitialization(scope: Scope) {
        if (!this.initialized) {
            this.initialize(scope);
            this.initialized = true;
        }
    }
}

export class Provider {

    private static _instance: Provider;
    private _directives: Record<string, Directive> = {};
    private _controller: Record<string, Controller> = {};
    private _routes: Record<string, string> = {};
    private _scopes: Record<string, Scope> = { root: new Scope() };
    private _route: Element | undefined;
    private _switcher: Switcher | undefined;
    private _pageStack: Array<string> = [];

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

    public pushPage(scope: Scope, path: string) {
        const id = this._routes[path];
        if (id) {
            const controller = this.getController(id);
            if (controller && this._route && this._switcher) {
                //scope.destroy();
                // TODO: fix scope for routes / controllers
                this._pageStack.unshift(path);
                this._switcher.pushPage(this._route, path, controller);
            }
            else console.error("no route or controller '" + id + "' not declared.");
        }
    }

    public popPage(scope: Scope) {
        if (this._pageStack.length < 1) return;
        this._pageStack.shift();
        const path = this._pageStack[0];
        if (path) {
            const id = this._routes[path];
            const controller = this.getController(id);
            if (controller && this._route && this._switcher)
                this._switcher.popPage(this._route, path, controller);
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
