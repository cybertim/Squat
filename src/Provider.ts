import { Scope } from "./Scope.ts";

export type Directive = {
    scope: boolean;
    link: (elem: HTMLElement, scope: Scope, action: string) => void;
};

export type Controller = {
    template: string;
    controller: (scope: Scope) => void;
};

export class Provider {
    private static _instance: Provider;
    private _directives: Map<string, Directive> = new Map();
    private _controller: Map<string, Controller> = new Map();
    private _root = new Scope();

    public static instance() {
        if (!Provider._instance) {
            Provider._instance = new Provider();
        }
        return Provider._instance;
    }

    public controller(name: string, controller: Controller) {
        this._controller.set(name, controller);
    }

    public getController(id: string) {
        return this._controller.get(id);
    }

    public directive(name: string, directive: Directive) {
        this._directives.set(name, directive);
    }

    public directives(map: Map<string, Directive>) {
        this._directives = map;
    }

    public get(name: string) {
        return this._directives.get(name);
    }

    public invoke(name: string) {
        // TODO: maybe map / cache controller per scope
        const controller = this._controller.get(name);
        // TODO add template to DOM
        if (controller) controller.controller(this._root);
    }

    public root() {
        return this._root;
    }

}
