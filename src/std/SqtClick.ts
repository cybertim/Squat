import { Directive } from "../Interfaces.ts";

export const SqtClick: Directive = {
    name: 'sqt-click',
    scope: false,
    link: (elem, scope, act) => {
        elem.onclick = (e) => {
            scope.exec(act);
            scope.digest();
        };
    }
}