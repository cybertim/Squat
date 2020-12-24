import { Directive } from "../Interfaces.ts";

export const SqtBind: Directive = {
    name: 'sqt-bind',
    scope: false,
    link: (elem, sqope, act) => {

        sqope.subscribe({
            name: act,
            callback: (obj) => {
                if (obj && typeof obj === 'string') elem.innerHTML = obj;
            }
        });

        const val = sqope.get(act);
        if (typeof val === 'string') elem.innerHTML = val;
    }
}