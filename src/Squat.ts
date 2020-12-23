/// <reference path="../lib/dom.d.ts" />

import { Scope } from "./Scope.ts";
import { Provider } from "./Provider.ts";
import { CompilerHalt, Controller, Directive, Route, Switcher } from "./Interfaces.ts";

// export function raw(strings: TemplateStringsArray, ...expr: string[]) {
//   return strings.join();
// }

export interface CompilerOptions {
    controllers: Controller[];
    routes: Route[];
    directives: Directive[];
    switcher: Switcher;
}

export class Squat {

    public static busy = false;

    public static bootstrap(options: CompilerOptions) {
        Provider.instance().setDirectives(options.directives);
        Provider.instance().setControllers(options.controllers);
        Provider.instance().setRoutes(options.routes);
        Provider.instance().setRouteSwitcher(options.switcher);
        // TODO: maybe add option to also not use the router and skip the sqt-router tag?
        // deno-lint-ignore no-undef
        this.compile(document.children[0], Provider.instance().getScope(), (n, d) => { console.log('yes'); return n === 'sqt-router' });
    }

    private static callDirectives(elem: Element, scope: Scope, stop?: CompilerHalt) {
        for (let i = 0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            const directive = Provider.instance().getDirectives(attr.name);
            if (directive) {
                const halt = stop && stop(attr.name, directive);
                this.busy = !halt;
                // deno-lint-ignore no-undef
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
        if (!Squat.busy) {
            for (let i = 0; i < element.children.length; i++)
                Squat.compile(element.children[i], _scope);
            _scope.digest();
        } else console.error("compiler is busy.");
    }

}
