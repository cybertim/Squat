/// <reference lib="esNext" />
/// <reference lib="dom" />
/// <reference lib="webworker.importScripts" />
/// <reference lib="ScriptHost" />
/// <reference lib="dom.iterable" />
/// <reference no-default-lib="true"/>

import { Scope } from "./Scope.ts";
import { Provider } from "./Provider.ts";
import { SQTObject } from "./Interfaces.ts";

export class Compiler {

  private static initialized = false;

  public static bootstrap() {
    if (!Compiler.initialized) Compiler.initialize();
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

  private static initialize() {
    Provider.instance().directive("sqt-repeat", {
      scope: false,
      link: (elem, scope, act) => {
        let scopes: Scope[] = [];

        const parts = act.split('in');
        const collectionName = parts[1].trim();
        const itemName = parts[0].trim();
        const parentNode = elem.parentNode;

        const render = (obj: SQTObject) => {

          while (parentNode && parentNode.firstChild) {
            parentNode.removeChild(parentNode.firstChild);
          }

          for (let i = 0; i < scopes.length; i++)scopes[i].destroy();
          scopes = [];

          const v = Scope.get(obj, collectionName);
          if (Array.isArray(v)) {
            for (const e of v) {
              const currentNode = <Element>elem.cloneNode(true);
              currentNode.removeAttribute('sqt-repeat');
              const s = scope.new();
              scopes.push(s);
              s.setObject(itemName, e);
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

        const obj = scope.getObject(collectionName);
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
            if (obj) elem.innerHTML = Scope.get(obj, act) || "";
          }
        });

        const obj = scope.getObject(act);
        if (obj) elem.innerHTML = Scope.get(obj, act) || "";
      }
    });

    Provider.instance().directive("sqt-click", {
      scope: false,
      link: (elem, scope, act) => {
        elem.onclick = () => {
          scope.execAction(act);
          scope.digest();
        };
      }
    });

    Provider.instance().directive("sqt-model", {
      scope: false,
      link: (elem, scope, act) => {
        if (elem instanceof HTMLInputElement) {

          elem.onkeyup = (e) => {
            let model = scope.getObject(act);
            if (!model) model = new SQTObject();
            model = Scope.set(model, act, elem.value);
            scope.setObject(act, model);
            scope.digest();
          };

          scope.subscribe({
            name: act,
            callback: (obj) => {
              if (obj) {
                elem.value = Scope.get(obj, act) || "";
              }
            }
          });
        }
      }
    });

    Compiler.initialized = true; // default derectives are now active.
  }

}
