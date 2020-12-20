/// <reference lib="esNext" />
/// <reference lib="dom" />
/// <reference lib="webworker.importScripts" />
/// <reference lib="ScriptHost" />
/// <reference lib="dom.iterable" />
/// <reference no-default-lib="true"/>

import { Scope } from "./Scope.ts";
import { Provider } from "./Provider.ts";

export function raw(strings: TemplateStringsArray, ...expr: string[]) {
  return strings.join();
}

export class Compiler {

  private static initialized = false;

  public static bootstrap() {
    if (!Compiler.initialized) Compiler.initialize(document.children[0]);
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

  private static initialize(elem: Element) {
    // const controllers = Provider.instance().controllers();
    // for (const key of controllers.keys()) {
    //   elem.innerHTML += '<template id="' + key + '">' + controllers.get(key)?.template + '</template>';
    // }

    // Provider.instance().directive("sqt-router", {
    //   scope: false,
    //   link: (elem, scope, act) => {
    //   }
    // });

    Provider.instance().directive("sqt-repeat", {
      scope: false,
      link: (elem, scope, act) => {
        let scopes: Scope[] = [];

        const parts = act.split('in');
        const collectionName = parts[1].trim();
        const itemName = parts[0].trim();
        const parentNode = elem.parentNode;

        const render = (obj: unknown) => {

          while (parentNode && parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
          }

          for (let i = 0; i < scopes.length; i++)scopes[i].destroy();
          scopes = [];

          const v = obj;//scope.get(collectionName);
          if (Array.isArray(v)) {
            for (const e of v) {
              const currentNode = <Element>elem.cloneNode(true);
              currentNode.removeAttribute('sqt-repeat');
              const s = scope.new();
              scopes.push(s);
              s.model[itemName] = e;
              if (parentNode) parentNode.appendChild(currentNode);
              Compiler.compile(currentNode, s);
            }
          }

        }

        scope.subscribe({
          name: collectionName,
          callback: (obj) => {
            if (obj) render(obj);
          }
        });

        const obj = scope.get(collectionName);
        if (obj) render(obj);
      }
    });

    Provider.instance().directive("sqt-controller", {
      scope: false,
      link: (elem, scope, act) => {
        Provider.instance().invoke(act);
      }
    });

    Provider.instance().directive("sqt-bind", {
      scope: false,
      link: (elem, scope, act) => {

        scope.subscribe({
          name: act,
          callback: (obj) => {
            if (obj && typeof obj === 'string') elem.innerHTML = obj;
          }
        });

        const val = scope.get(act);
        if (typeof val === 'string') elem.innerHTML = val;
      }
    });

    Provider.instance().directive("sqt-click", {
      scope: false,
      link: (elem, scope, act) => {
        elem.onclick = () => {
          scope.exec(act);
          scope.digest();
        };
      }
    });

    Provider.instance().directive("sqt-model", {
      scope: false,
      link: (elem, scope, act) => {
        if (elem instanceof HTMLInputElement) {

          elem.onkeyup = (e) => {
            scope.set(act, elem.value)
            scope.digest();
          };

          scope.subscribe({
            name: act,
            callback: (obj) => {
              if (obj && typeof obj === 'string') elem.value = obj;
            }
          });
        }
      }
    });

    Compiler.initialized = true; // default derectives are now active.
  }

}
