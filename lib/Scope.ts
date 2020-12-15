
export type Watcher = {
    exp: string,
    fn: (value: string) => void,
    last: Object
}

export class Scope {

    private static counter: number = 0;
    private children: Scope[] = [];
    private watchers: Watcher[] = [];

    constructor(private id?: number, private parent?: Scope) {
        id = id || 0;
    }

    public new() {
        Scope.counter++;
        const obj = new Scope(Scope.counter, this);
        this.children.push(obj);
        return obj;
    }

    public eval(expr: string): string {
        // TODO: make it so it could be a function that can be called...
        return expr;
    }

    public watch(watcher: Watcher) {
        this.watchers.push(watcher);
    }

    public digest() {
        let dirty = false;
        let watcher: Watcher;
        do {
            dirty = false;
            for (let i = 0; i < this.watchers.length; i++) {
                watcher = this.watchers[i];
                let current = this.eval(watcher.exp);
                if (!Scope.equals(watcher.last, current)) {
                    watcher.last = Scope.clone(current);
                    dirty = true;
                    watcher.fn(current);
                }
            }
        } while (dirty);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].digest();
        }
    }

    private static equals(a: Object, b: Object) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    private static clone(a: Object) {
        try {
            return JSON.parse(JSON.stringify(a));
        } catch (e) {
            return undefined;
        }
    }
}
