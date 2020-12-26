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

            const nodeAmount = parentNode?.childNodes.length;
            if (nodeAmount && parentNode) {
                const rmNodeArr: Element[] = [];
                for (let i = 0; i < nodeAmount; i++) {
                    const node = parentNode?.childNodes[i];
                    if (node instanceof Element) {
                        if (node.hasAttribute("sqt-repeat") || node.hasAttribute("sqt-repeat-child")) {
                            rmNodeArr.push(node);
                        }
                    }
                }
                for (const node of rmNodeArr) parentNode?.removeChild(node);
            }

            for (let i = 0; i < sqopes.length; i++)sqopes[i].destroy();
            sqopes = [];

            const v = obj;
            if (Array.isArray(v)) {
                for (const e of v) {
                    const currentNode = <Element>elem.cloneNode(true);
                    currentNode.removeAttribute('sqt-repeat');
                    currentNode.setAttribute("sqt-repeat-child", "");
                    const obj: Record<string, unknown> = {};
                    obj[itemName] = e;
                    const s = sqope.new(obj);
                    sqopes.push(s);
                    if (parentNode) parentNode.appendChild(currentNode);
                    if (!Squat.busy) Squat.compile(currentNode, s);
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