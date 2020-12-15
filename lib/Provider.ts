/// <reference lib="es2017" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="scripthost" />

import { Scope } from "./Scope.ts";

export type Directive = {
    scope: boolean;
    link: (elem: HTMLElement, scope: Scope, expression: string) => void;
};

export type Controller = (scope: Scope) => void;

export class Provider {
    private static _instance: Provider;
    private _directives: Map<string, Directive> = new Map();
    private _controller: Map<string, Controller> = new Map();

    public static instance() {
        if (!Provider._instance) {
            Provider._instance = new Provider();
        }
        return Provider._instance;
    }

    public controller(name: string, controller: Controller) {
        this._controller.set(name, controller);
    }

    public directive(name: string, directive: Directive) {
        this._directives.set(name, directive);
    }

    public get(name: string) {
        return this._directives.get(name);
    }

    // private invoke(provider: Directive, locals?: Map<string, string>) {
    //     locals = locals || new Map();
    //     this.annotate(provider).map;
    // }

    // private annotate(fn: Directive) {
    //     const res = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, "")
    //         .match(/\((.*?)\)/);
    //     if (res && res[1]) {
    //         return res[1].split(",").map((d) => d.trim());
    //     }
    //     return [];
    // }
}
