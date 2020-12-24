/// <reference path="../../lib/onsenui.d.ts" />

import ons from "../../lib/onsenui.d.ts";
import { Squat } from "../Squat.ts";
import { Controller, Switcher } from "../Interfaces.ts";
import { Provider } from "../Provider.ts";

export class OnsenUISwitcher extends Switcher {

    initialize(element: Element): void {
        const loader = (options: { page: string | Element, parent: Element }, done: (elem: Element | null | undefined) => void) => {
            // deno-lint-ignore no-undef
            var wrapper = document.createElement('div');
            const controller = Provider.instance().getController(<string>options.page);
            if (controller) wrapper.innerHTML = "" + controller.template;
            options.page = wrapper.children[0];
            options.parent.appendChild(options.page);
            done(options.page);
        };

        const unloader = (page: Element) => {
            page.remove();
        }

        (<ons.OnsNavigatorElement>element).pageLoader = new ons.PageLoader(loader, unloader);
    }

    _pushPage(element: Element, path: string, controller: Controller): void {
        if (controller.template) {
            (<ons.OnsNavigatorElement>element).pushPage(controller.constructor.name, {
                callback: () => { OnsenUISwitcher.callback(element, path, controller) }
            });
        }
    }

    _popPage(element: Element, path: string, controller: Controller) {
        if (controller.template) {
            console.debug("triggered.");
            (<ons.OnsNavigatorElement>element).popPage({
                callback: () => { OnsenUISwitcher.callback(element, path, controller) }
            });
        }
    }

    static callback(element: Element, path: string, controller: Controller) {
        console.debug("callback");
        Squat.finish(element, path, controller);
    }
}