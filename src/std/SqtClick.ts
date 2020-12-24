import { Directive } from "../Interfaces.ts";

export const SqtClick: Directive = {
    name: 'sqt-click',
    scope: false,
    link: (elem, sqope, act) => {
        elem.onclick = (e) => {
            sqope.exec(act);
            sqope.digest();
        };
    }
}