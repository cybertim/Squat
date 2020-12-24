import { Controller, Watcher } from "./Interfaces.ts";

export class Sqope {

    private static counter = 0;
    private watchers: Watcher[] = [];
    private children: Sqope[] = [];

    constructor(private id?: number, public parent?: Sqope, private controller?: Controller) { }

    public new(controller?: Controller) {
        Sqope.counter++;
        const obj = new Sqope(Sqope.counter, this, controller);
        this.children.push(obj);
        return obj;
    }

    public destroy() {
        const pc = this.parent?.children;
        if (pc) pc.splice(pc.indexOf(this), 1);
    }

    public subscribe(watcher: Watcher) {
        this.watchers.push(watcher);
    }

    public digest() {
        for (let i = 0; i < this.watchers.length; i++) {
            const watcher = this.watchers[i];
            const value = Sqope.get(watcher.name, this.controller);
            if (value && value !== watcher.last) {
                watcher.last = Sqope.clone(value);
                watcher.callback(value);
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].digest();
        }
    }

    public exec(name: string) {
        if (this.controller) {
            Sqope.exec(name, this.controller);
            return true;
        }
        return false;
    }

    public set(name: string, value: string) {
        if (this.controller) Sqope.set(name, value, this.controller);
    }

    public get(name: string) {
        if (this.controller) return Sqope.get(name, this.controller);
        return undefined;
    }

    public static set(name: string, value: string, obj: unknown) {
        const items = name.split('.');
        const item = items[0];
        const names = Object.getOwnPropertyNames(obj);
        if (names.includes(item)) {
            const values = Object.getOwnPropertyDescriptors(obj);
            switch (typeof values[item].value) {
                case 'object':
                    items.shift();
                    Sqope.set(items.join('.'), value, (<Record<string, unknown>>obj)[item]);
                    break;
                case 'string':
                case 'boolean':
                case 'number':
                case 'bigint':
                    (<Record<string, unknown>>obj)[item] = value;
                    break;
            }
        }
    }

    public static get(name: string, obj: unknown): undefined | string | boolean | number | bigint {
        const items = name.split('.');
        const item = items[0];
        const names = Object.getOwnPropertyNames(obj);
        if (names.includes(item)) {
            const values = Object.getOwnPropertyDescriptors(obj);
            switch (typeof values[item].value) {
                case 'object':
                    items.shift();
                    return Sqope.get(items.join('.'), (<Record<string, unknown>>obj)[item]);
                case 'string':
                case 'boolean':
                case 'number':
                case 'bigint':
                    return (<Record<string, string | boolean | number | bigint>>obj)[item];
                case 'function':
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    public static exec(name: string, parent: unknown, obj?: unknown) {
        const items = name.split('.');
        const item = items[0];
        const names = Object.getOwnPropertyNames(obj ? obj : parent);
        if (names.includes(item)) {
            const values = Object.getOwnPropertyDescriptors(obj ? obj : parent);
            const value = values[item].value;
            switch (typeof value) {
                case 'object':
                    items.shift();
                    Sqope.exec(items.join('.'), parent, (<Record<string, unknown>>(obj ? obj : parent))[item]);
                    break;
                case 'function':
                    value(parent);
                    break;
                default:
                    break;
            }
        }
        return undefined;
    }

    private static clone(a: unknown) {
        try {
            return JSON.parse(JSON.stringify(a));
        } catch (e) {
            return undefined;
        }
    }
}