
export type Watcher = {
    act: string,
    fn: (value: string[] | string) => void,
    last?: string | string[]
}

export type Action = (scope: Scope) => (void | string);

export class Scope {

    private static counter = 0;
    public children: Scope[] = [];
    private watchers: Watcher[] = [];

    private actions: Map<string, Action> = new Map();
    public values: Map<string, string[] | string> = new Map();

    constructor(private id?: number, public parent?: Scope) {
        id = id || 0;
    }

    public value(name: string, value: string[] | string) {
        this.values.set(name, value);
    }

    public action(name: string, action: Action) {
        this.actions.set(name, action);
    }

    public new() {
        Scope.counter++;
        const obj = new Scope(Scope.counter, this);
        this.children.push(obj);
        return obj;
    }

    public watch(watcher: Watcher) {
        this.watchers.push(watcher);
    }

    public exec(act: string) {
        const action = this.actions.get(act);
        if (action) return action(this);
        else return undefined;
    }

    public destroy() {
        const pc = this.parent?.children;
        if (pc) pc.splice(pc.indexOf(this), 1);
    }

    public digest() {
        // let dirty = false;
        let watcher: Watcher;
        // do {
        //     dirty = false;
        for (let i = 0; i < this.watchers.length; i++) {
            watcher = this.watchers[i];
            const val = this.values.get(watcher.act);//this.exec(watcher.act);
            if (val && val !== watcher.last) {
                watcher.last = val;
                watcher.fn(val);
            }
            // if (!Scope.equals(watcher.last, current)) {
            //     watcher.last = Scope.clone(current);
            //     dirty = true;
            //     watcher.fn(current);
            // }
        }
        // } while (dirty);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].digest();
        }
    }

    // private static equals(a: unknown, b: unknown) {
    //     return JSON.stringify(a) === JSON.stringify(b);
    // }

    // private static clone(a: unknown) {
    //     try {
    //         return JSON.parse(JSON.stringify(a));
    //     } catch (e) {
    //         return undefined;
    //     }
    // }
}
