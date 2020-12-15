/// <reference lib="esNext" />
/// <reference lib="dom" />

import { Scope } from "./Scope.ts";
import { Provider } from "./Provider.ts";

export class Compiler {

  public static bootstrap() {
    this.compile(document.children[0], Provider.instance().root());
  }

  private static callDirectives(elem: Element, scope: Scope) {
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      const directive = Provider.instance().get(attr.name);
      if (directive) {
        if (elem instanceof HTMLElement) directive.link(elem, scope, attr.value);
      }
    }
  }

  public static compile(elem: Element, scope: Scope) {
    this.callDirectives(elem, scope);
    for (let i = 0; i < elem.children.length; i++) {
      const child = elem.children.item(i);
      if (child !== null) this.compile(child, scope);
    }
  }
}
