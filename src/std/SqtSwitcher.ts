import { Squat } from "../Squat.ts";
import { Controller, Switcher } from "../Interfaces.ts";

export class SqtSwitcher extends Switcher {
    initialize(element: Element): void {
        console.log("Switcher is ready.");
    }

    _pushPage(element: Element, path: string, controller: Controller): void {
        this.goTo(element, path, controller);
    }

    _popPage(element: Element, path: string, controller: Controller): void {
        this.goTo(element, path, controller);
    }

    goTo(element: Element, path: string, controller: Controller): void {
        const template = Squat.template(controller);
        if (template) {
            element.innerHTML = template;
            Squat.finish(element, path, controller);
        } else console.error("No template set on controller at path", path);
    }
}