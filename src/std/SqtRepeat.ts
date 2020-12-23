import { Squat } from "../Squat.ts";
import { Directive } from "../Interfaces.ts";
import { Scope } from "../Scope.ts";

export const SqtRepeat: Directive = {
    name: 'sqt-repeat',
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

            const v = obj;
            if (Array.isArray(v)) {
                for (const e of v) {
                    const currentNode = <Element>elem.cloneNode(true);
                    currentNode.removeAttribute('sqt-repeat');
                    const s = scope.new();
                    scopes.push(s);
                    s.model[itemName] = e;
                    if (parentNode) parentNode.appendChild(currentNode);
                    Squat.compile(currentNode, s);
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
}