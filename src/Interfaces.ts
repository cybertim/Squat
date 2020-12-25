/// <reference path="../lib/dom.d.ts" />
import { Sqope } from "./Sqope.ts";


export abstract class Switcher {
    protected initialized = false;
    abstract initialize(element: Element): void;
    abstract _pushPage(element: Element, path: string, controller: Controller): void;
    abstract _popPage(element: Element, path: string, controller: Controller): void;

    pushPage(element: Element, path: string, controller: Controller) {
        if (!this.initialized) {
            this.initialize(element);
            this.initialized = true;
        }
        this._pushPage(element, path, controller);
    }

    popPage(element: Element, path: string, controller: Controller) {
        this._popPage(element, path, controller);
    }
}

export type CompilerHalt = (name: string, directive: Directive) => boolean;

export type Route = {
    path: string,
    controllerName: string
}

export type Directive = {
    name: string;
    scope: boolean;
    link: (elem: HTMLElement, sqope: Sqope, action: string) => void;
}

export abstract class Controller {
    public initialized = false;
    abstract sqtInit: (sqope: Sqope) => void;
}

type Constructor<T> = { new(...args: []): T };

export function Model<T>(options: { template: string }) {
    return function (Class: Constructor<T>) {
        Object.defineProperty(Class.prototype, "template", {
            value: options.template
        });
    }
}


// export abstract class Controller {
//     protected initialized = false;
//     abstract template: string | undefined;
//     abstract initialize(sqope: Sqope): void;
//     doInitialization(sqope: Sqope) {
//         if (!this.initialized) {
//             this.initialize(sqope);
//             this.initialized = true;
//         }
//     }
// }

export type Watcher = {
    name: string,
    callback: (value?: unknown) => void,
    last?: unknown
}
