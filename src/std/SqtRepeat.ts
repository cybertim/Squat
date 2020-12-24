import { Squat } from "../Squat.ts";
import { Directive } from "../Interfaces.ts";
import { Sqope } from "../Sqope.ts";

export const SqtRepeat: Directive = {
    name: 'sqt-repeat',
    scope: false,
    link: (elem, sqope, act) => {
        let sqopes: Sqope[] = [];

        const parts = act.split('in');
        const collectionName = parts[1].trim();
        const itemName = parts[0].trim();
        const parentNode = elem.parentNode;

        const render = (obj: unknown) => {

            while (parentNode && parentNode.firstChild) {
                parentNode.removeChild(parentNode.firstChild);
            }

            for (let i = 0; i < sqopes.length; i++)sqopes[i].destroy();
            sqopes = [];

            const v = obj;
            if (Array.isArray(v)) {
                for (const e of v) {
                    const currentNode = <Element>elem.cloneNode(true);
                    currentNode.removeAttribute('sqt-repeat');
                    const obj: Record<string, unknown> = {};
                    obj[itemName] = e;
                    const s = sqope.new(obj);
                    sqopes.push(s);
                    // TODO: decorate 'e' as a controller - add the methods - is it needed??
                    console.log(e);
                    //s.model[itemName] = e;                    
                    if (parentNode) parentNode.appendChild(currentNode);
                    Squat.compile(currentNode, s);
                }
            }

        }

        sqope.subscribe({
            name: collectionName,
            callback: (obj) => {
                if (obj) render(obj);
            }
        });

        const obj = sqope.get(collectionName);
        if (obj) render(obj);
    }
}