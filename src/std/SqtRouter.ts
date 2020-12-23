import { Directive } from "../Interfaces.ts";
import { Provider } from "../Provider.ts";

export const SqtRouter: Directive = {
    name: 'sqt-router',
    scope: false,
    link: (elem, scope, act) => {
        Provider.instance().setRouterElement(elem);

        // TODO: use the 'act' for default path to visit?
        Provider.instance().pushPage(scope, "/");
    }
}