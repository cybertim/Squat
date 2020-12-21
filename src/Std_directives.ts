import { Compiler } from "./Compiler.ts";
import { Directive, Provider } from "./Provider.ts";
import { Router } from "./Router.ts";
import { Scope } from "./Scope.ts";

export const Std_directives: Map<string, Directive> = new Map([

  ["sqt-router", {
    scope: false,
    link: (elem, scope, act) => {
      Router.instance().setRoot(elem);
      // TODO: use the 'act' for default path to visit?
      Router.instance().navigate(scope, "/");
    }
  }],

  ["sqt-controller", {
    scope: false,
    link: (elem, scope, act) => {
      Provider.instance().invoke(act);
    }
  }],

  ["sqt-repeat", {
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
  }],

  ["sqt-bind", {
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
  }],

  ["sqt-click", {
    scope: false,
    link: (elem, scope, act) => {
      elem.onclick = () => {
        scope.exec(act);
        scope.digest();
      };
    }
  }],

  ["sqt-model", {
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
  }]

]);
