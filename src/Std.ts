import { Compiler, Switcher } from "./Compiler.ts";
import { Directive, Provider } from "./Provider.ts";
import { Scope } from "./Scope.ts";

export const stdOnsenSwitcher: Switcher = (element, path, controller) => {
  if (controller.template) {
    const loader = (options: { page: Element, parent: Element }, done: (elem: Element | null | undefined) => void) => {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = "" + controller.template;
      options.page = wrapper.children[0];
      options.parent.appendChild(options.page);
      done(options.page);
    };

    const unloader = (page: Element) => {
      page.remove();
    }

    (<ons.OnsNavigatorElement>element).pageLoader = new ons.PageLoader(loader, unloader);

    (<ons.OnsNavigatorElement>element).pushPage(controller.constructor.name, {
      callback: () => {
        const _scope = Provider.instance().getScope(path);
        controller.doInitialization(_scope);
        if (!Compiler.busy) {
          for (let i = 0; i < element.children.length; i++)
            Compiler.compile(element.children[i], _scope);
        }
      }
    });
  }
}

export const stdSwitcher: Switcher = (element, path, controller) => {
  if (controller.template) {
    element.innerHTML = controller.template;
    const _scope = Provider.instance().getScope(path);
    controller.doInitialization(_scope);
    if (!Compiler.busy) {
      for (let i = 0; i < element.children.length; i++)
        Compiler.compile(element.children[i], _scope);
      _scope.digest();
    } else console.error("Compiler was still busy...");
  } else console.error("No template set on controller at path", path);
};

export const stdDirectives: Record<string, Directive> = {

  "sqt-router": {
    scope: false,
    link: (elem, scope, act) => {
      Provider.instance().setRouteElement(elem);
      // TODO: use the 'act' for default path to visit?
      Provider.instance().navigate(scope, "/");
    }
  },

  "sqt-repeat": {
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
  },

  "sqt-bind": {
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
  },

  "sqt-click": {
    scope: false,
    link: (elem, scope, act) => {
      elem.onclick = () => {
        scope.exec(act);
        scope.digest();
      };
    }
  },

  "sqt-model": {
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
  }

};
