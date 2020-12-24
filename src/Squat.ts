/// <reference path="../lib/dom.d.ts" />

import { Provider } from "./Provider.ts";
import { CompilerHalt, Controller, Directive, Route, Switcher } from "./Interfaces.ts";
import { Sqope } from "./Sqope.ts";

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
        this.compile(document.children[0], Provider.instance().getSqope(), (n, d) => { return n === 'sqt-router' });
    }

    private static callDirectives(elem: Element, sqope: Sqope, stop?: CompilerHalt) {
        for (let i = 0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            const directive = Provider.instance().getDirectives(attr.name);
            if (directive) {
                const halt = stop && stop(attr.name, directive);
                this.busy = !halt;
                // deno-lint-ignore no-undef
                if (elem instanceof HTMLElement) directive.link(elem, sqope, attr.value);
                if (halt) return false;
            }
        }
        return true;
    }

    public static compile(elem: Element, sqope: Sqope, stop?: CompilerHalt) {
        this.busy = true;
        if (this.callDirectives(elem, sqope, stop)) {
            for (let i = 0; i < elem.children.length; i++) {
                const child = elem.children.item(i);
                if (child !== null) this.compile(child, sqope, stop);
            }
        }
        this.busy = false;
    }

    public static finish(element: Element, path: string, controller: Controller) {
        const _sqope = Provider.instance().getSqope(path, controller);
        console.debug(path, _sqope);
        controller.doInitialization(_sqope);
        if (!Squat.busy) {
            for (let i = 0; i < element.children.length; i++)
                Squat.compile(element.children[i], _sqope);
            _sqope.digest();
        } else console.error("compiler is busy.");
    }

}
