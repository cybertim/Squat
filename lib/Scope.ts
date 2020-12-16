import { SQTAction, SQTObject, SQTWatcher } from "./Interfaces.ts";

export class Scope {

    private static counter = 0;
    public children: Scope[] = [];
    private watchers: SQTWatcher[] = [];

    private actions: Map<string, SQTAction> = new Map();
    public objects: Map<string, SQTObject> = new Map();

    constructor(private id?: number, public parent?: Scope) {
        id = id || 0;
    }

    public setObject<T extends SQTObject>(name: string, object: T) {
        const ref = Scope.sanitize(name);
        if (!object.uuid) object.uuid = Scope.uuidv4();
        this.objects.set(ref, object);
    }

    public getObject<T extends SQTObject>(name: string) {
        const ref = Scope.sanitize(name);
        const obj = this.objects.get(ref);
        if (obj) return <T>obj;
        else return undefined;
    }

    public setAction(name: string, action: SQTAction) {
        this.actions.set(name, action);
    }

    public execAction(name: string) {
        const obj = this.objects.get(name);
        const act = this.actions.get(name);
        if (act) {
            act(obj);
        }
    }

    public subscribe(watcher: SQTWatcher) {
        watcher.name = Scope.sanitize(watcher.name);
        this.watchers.push(watcher);
    }

    public new() {
        Scope.counter++;
        const obj = new Scope(Scope.counter, this);
        this.children.push(obj);
        return obj;
    }

    public destroy() {
        const pc = this.parent?.children;
        if (pc) pc.splice(pc.indexOf(this), 1);
    }

    public digest() {
        for (let i = 0; i < this.watchers.length; i++) {
            const watcher = this.watchers[i];
            const value = this.getObject(watcher.name);
            if (value && !Scope.equals(value, watcher.last)) {
                watcher.last = Scope.clone(value);
                watcher.callback(value);
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].digest();
        }
    }

    private static equals(a: unknown, b: unknown) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    public static get(obj: SQTObject, action: string) {
        const parts = action.trim().split('.');
        let itemName = action;
        let memberName = "";
        if (parts.length > 0) {
            itemName = parts[0];
            memberName = parts[1];
        }
        if (memberName && memberName.length > 0) {
            //const v = Object.getOwnPropertyDescriptor(obj, memberName);
            //if (v && v.value) return v.value;
            return (<Record<string, string>>obj)[memberName];
        } else {
            return obj.value;
        }
    }

    public static set(obj: SQTObject, action: string, val: string) {
        const parts = action.trim().split('.');
        let itemName = action;
        let memberName = "";
        if (parts.length > 0) {
            itemName = parts[0];
            memberName = parts[1];
        }
        if (memberName && memberName.length > 0) {
            (<Record<string, string>>obj)[memberName] = val;
        } else {
            obj.value = val;
        }
        return obj;
    }

    public static sanitize(action: string) {
        const parts = action.trim().split('.');
        return parts[0];
    }

    public static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private static clone(a: unknown) {
        try {
            return JSON.parse(JSON.stringify(a));
        } catch (e) {
            return undefined;
        }
    }

}
