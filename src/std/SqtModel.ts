import { Directive } from "../Interfaces.ts";

export const SqtModel: Directive = {
    name: 'sqt-model',
    scope: false,
    link: (elem, scope, act) => {
        // deno-lint-ignore no-undef
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