import { Directive } from "../Interfaces.ts";

export const SqtModel: Directive = {
    name: 'sqt-model',
    scope: false,
    link: (elem, sqope, act) => {
        // deno-lint-ignore no-undef
        if (elem instanceof HTMLInputElement) {

            elem.onkeyup = (e) => {
                sqope.set(act, elem.value)
                sqope.digest();
            };

            sqope.subscribe({
                name: act,
                callback: (obj) => {
                    if (obj && typeof obj === 'string') elem.value = obj;
                }
            });
        }
    }
}