/// <reference lib="esNext" />
/// <reference lib="dom" />
/// <reference lib="webworker.importScripts" />
/// <reference lib="ScriptHost" />
/// <reference lib="dom.iterable" />
/// <reference no-default-lib="true"/>

import { Scope } from "./Scope.ts";
import { Controller, Directive, Provider } from "./Provider.ts";

// export function raw(strings: TemplateStringsArray, ...expr: string[]) {
//   return strings.join();
// }

//export type Switcher = (element: Element, path: string, controller: Controller) => void;

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

export interface CompilerOptions {
    controllers: Controller[];
    routes: Record<string, string>;
    directives: Record<string, Directive>;
    switcher: Switcher;
}

export class Compiler {

    public static busy = false;

    public static bootstrap(options: CompilerOptions) {
        Provider.instance().setDirectives(options.directives);
        Provider.instance().setControllers(options.controllers);
        Provider.instance().setRoutes(options.routes);
        Provider.instance().setRouteSwitcher(options.switcher);
        // TODO: maybe add option to also not use the router and skip the sqt-router tag?
        this.compile(document.children[0], Provider.instance().getScope(), (n, d) => { console.log('yes'); return n === 'sqt-router' });
    }

    private static callDirectives(elem: Element, scope: Scope, stop?: CompilerHalt) {
        for (let i = 0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            const directive = Provider.instance().getDirectives(attr.name);
            if (directive) {
                const halt = stop && stop(attr.name, directive);
                this.busy = !halt;
                if (elem instanceof HTMLElement) directive.link(elem, scope, attr.value);
                if (halt) return false;
            }
        }
        return true;
    }

    public static compile(elem: Element, scope: Scope, stop?: CompilerHalt) {
        this.busy = true;
        if (this.callDirectives(elem, scope, stop)) {
            for (let i = 0; i < elem.children.length; i++) {
                const child = elem.children.item(i);
                if (child !== null) this.compile(child, scope, stop);
            }
        }
        this.busy = false;
    }

    public static finish(element: Element, path: string, controller: Controller) {
        const _scope = Provider.instance().getScope(path);
        console.debug(path, _scope);
        controller.doInitialization(_scope);
        if (!Compiler.busy) {
            for (let i = 0; i < element.children.length; i++)
                Compiler.compile(element.children[i], _scope);
            _scope.digest();
        } else console.error("compiler is busy.");
    }

}
