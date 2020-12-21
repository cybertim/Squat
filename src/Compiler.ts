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

export type Switcher = (element: Element, path: string, controller: Controller) => void;

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
    this.compile(document.children[0], Provider.instance().root());
  }

  private static callDirectives(elem: Element, scope: Scope) {
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      const directive = Provider.instance().getDirectives(attr.name);
      if (directive) {
        if (elem instanceof HTMLElement) directive.link(elem, scope, attr.value);
      }
    }
  }

  public static compile(elem: Element, scope: Scope) {
    this.busy = true;
    this.callDirectives(elem, scope);
    for (let i = 0; i < elem.children.length; i++) {
      const child = elem.children.item(i);
      if (child !== null) this.compile(child, scope);
    }
    this.busy = false;
  }

}
