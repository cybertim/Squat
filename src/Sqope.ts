import { Controller, Watcher } from "./Interfaces.ts";

export class Sqope {

    private watchers: Watcher[] = [];
    public children: Sqope[] = [];

    constructor(public parent?: Sqope, public controller?: Controller | Record<string, unknown>) { }

    public new(controller?: Controller | Record<string, unknown>) {
        const obj = new Sqope(this, controller);
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

    public exec(name: string, sqope?: Sqope, obj?: unknown) {
        const items = name.split('.');
        const item = items[0];
        const names = Object.getOwnPropertyNames(obj ? obj : this.controller);
        if (names.includes(item)) {
            const values = Object.getOwnPropertyDescriptors(obj ? obj : this.controller);
            const value = values[item].value;
            switch (typeof value) {
                case 'object':
                    items.shift();
                    this.exec(items.join('.'), sqope, (<Record<string, unknown>>(obj ? obj : this.controller))[item]);
                    return;
                case 'function':
                    value(sqope ? sqope : this);
                    return;
                default:
                    break;
            }
        }
        if (this.parent) this.parent.exec(name, sqope ? sqope : this);
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

    public static get(name: string, obj: unknown): undefined | string | boolean | number | bigint | Array<unknown> {
        const items = name.split('.');
        const item = items[0];
        const names = Object.getOwnPropertyNames(obj);
        if (names.includes(item)) {
            const values = Object.getOwnPropertyDescriptors(obj);
            const value = values[item].value;
            switch (typeof value) {
                case 'object':
                    if (!Array.isArray(value)) {
                        // When the item is not an array, all types are covered and this must be a (sub)class 
                        // so we go recursive into it...
                        items.shift();
                        return Sqope.get(items.join('.'), (<Record<string, unknown>>obj)[item]);
                    }
                    return (<Record<string, Array<unknown>>>obj)[item];
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

    private static clone(a: unknown) {
        try {
            return JSON.parse(JSON.stringify(a));
        } catch (e) {
            return undefined;
        }
    }
}