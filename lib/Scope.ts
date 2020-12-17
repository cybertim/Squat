export type Watcher = {
    name: string,
    callback: (value?: unknown) => void,
    last?: unknown
}

export class Scope {

    private static counter = 0;
    public children: Scope[] = [];
    private watchers: Watcher[] = [];

    public model: Record<string, unknown> = {};

    constructor(private id?: number, public parent?: Scope) {
        id = id || 0;
    }

    public exec(name: string, scope?: Scope) {
        const ref = Scope.sanitize(name);
        const action = this.model[ref.itemName];
        if (typeof action === 'function') action(scope ? scope : this);
        else if (this.parent) this.parent.exec(name, scope ? scope : this);
    }

    public get(name: string) {
        const ref = Scope.sanitize(name);
        if (typeof this.model[ref.itemName] === 'object') {
            if (ref.memberName) return (<Record<string, unknown>>this.model[ref.itemName])[ref.memberName];
            else return <object>this.model[ref.itemName];
        } else if (typeof this.model[ref.itemName] !== 'function') {
            return <unknown>this.model[ref.itemName];
        }
        return undefined;
    }

    public set(name: string, value: unknown) {
        const ref = Scope.sanitize(name);
        if (typeof this.model[ref.itemName] === 'object') {
            if (ref.memberName) (<Record<string, unknown>>this.model[ref.itemName])[ref.memberName] = value;
            else this.model[ref.itemName] = value;
        } else if (typeof this.model[ref.itemName] !== 'function') {
            this.model[ref.itemName] = value;
        }
    }

    public subscribe(watcher: Watcher) {
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
            //const value = this.getObject(watcher.name);
            const value = this.get(watcher.name);
            if (value && value !== watcher.last) {
                watcher.last = Scope.clone(value);
                watcher.callback(value);
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].digest();
        }
    }

    public static sanitize(action: string) {
        const parts = action.trim().split('.');
        let itemName = action;
        let memberName = undefined;
        if (parts.length > 0) {
            itemName = parts[0];
            memberName = parts[1];
        }
        return {
            itemName: itemName,
            memberName: memberName
        };
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
