import { Env } from "./env";

export class EmptyTokenError extends Error {
    statusCode = 400;

    constructor(message: string) {
        super(message);

        // 👇️ because we are extending a built-in class
        Object.setPrototypeOf(this, EmptyTokenError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
export type TLType = TLList | TLNumber | TLString | TLNil | TLBoolean | TLSymbol | TLKeyword | TLVector | TLHashMap | TLFunction | TLAtom;

export const enum Node {
    List = 1,
    Number,
    String,
    Nil,
    Boolean,
    Symbol,
    Keyword,
    Vector,
    HashMap,
    Function,
    Atom,
}

export function equals(a: TLType, b: TLType, strict?: boolean): boolean {
    if (strict && a.type !== b.type) {
        return false;
    }

    if (a.type === Node.Nil && b.type === Node.Nil) {
        return true;
    }
    if (isSeq(a) && isSeq(b)) {
        return listEquals(a.list, b.list);
    }
    if (a.type === Node.HashMap && b.type === Node.HashMap) {
        if (a.keywordMap.size !== b.keywordMap.size) {
            return false;
        }
        if (Object.keys(a.stringMap).length !== Object.keys(b.stringMap).length) {
            return false;
        }
        for (const [aK, aV] of a.entries()) {
            if (aK.type !== Node.String && aK.type !== Node.Keyword) {
                throw new Error(`unexpected symbol: ${aK.type}, expected: string or keyword`);
            }
            const bV = b.get(aK);
            if (aV.type === Node.Nil && bV.type === Node.Nil) {
                continue;
            }
            if (!equals(aV, bV)) {
                return false;
            }
        }

        return true;
    }
    if (
        (a.type === Node.Number && b.type === Node.Number)
        || (a.type === Node.String && b.type === Node.String)
        || (a.type === Node.Boolean && b.type === Node.Boolean)
        || (a.type === Node.Symbol && b.type === Node.Symbol)
        || (a.type === Node.Keyword && b.type === Node.Keyword)
    ) {
        return a.v === b.v;
    }

    return false;

    function listEquals(a: TLType[], b: TLType[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i], strict)) {
                return false;
            }
        }
        return true;
    }
}

export function isSeq(ast: TLType): ast is TLList | TLVector {
    return ast.type === Node.List || ast.type === Node.Vector;
}

export function isAST(v: TLType): v is TLType {
    return !!v.type;
}

export class Seq {
    type?: Node.List = Node.List;
    meta?: TLType;
    constructor(public list: TLType[]){}

}
export class TLList{
    type: Node.List = Node.List;
    meta?: TLType;

    constructor(public list: TLType[]) {
    }

    withMeta(meta: TLType) {
        const v = new TLList(this.list);
        v.meta = meta;
        return v;
    }
}

export class TLNumber {
    type: Node.Number = Node.Number;
    meta?: TLType;

    constructor(public v: number) {
    }

    withMeta(meta: TLType) {
        const v = new TLNumber(this.v);
        v.meta = meta;
        return v;
    }
}

export class TLString {
    type: Node.String = Node.String;
    meta?: TLType;

    constructor(public v: string) {
    }

    withMeta(meta: TLType) {
        const v = new TLString(this.v);
        v.meta = meta;
        return v;
    }
}

export class TLNil {

    private static _instance?: TLNil;

    static get instance(): TLNil {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new TLNil();
        return this._instance;
    }

    type: Node.Nil = Node.Nil;
    meta?: TLType;

    private constructor() { }

    withMeta(_meta: TLType): TLNil {
        throw new Error(`not supported`);
    }
}

export class TLBoolean {
    type: Node.Boolean = Node.Boolean;
    meta?: TLType;

    constructor(public v: boolean) {
    }

    withMeta(meta: TLType) {
        const v = new TLBoolean(this.v);
        v.meta = meta;
        return v;
    }
}

export class TLSymbol {
    static map = new Map<symbol, TLSymbol>();

    static get(name: string): TLSymbol {
        const sym = Symbol.for(name);
        let token = this.map.get(sym);
        if (token) {
            return token;
        }
        token = new TLSymbol(name);
        this.map.set(sym, token);
        return token;
    }

    type: Node.Symbol = Node.Symbol;
    meta?: TLType;

    private constructor(public v: string) {
    }

    withMeta(_meta: TLType): TLSymbol {
        throw new Error(`not supported`);
    }
}

export class TLKeyword {
    static map = new Map<symbol, TLKeyword>();

    static get(name: string): TLKeyword {
        const sym = Symbol.for(name);
        let token = this.map.get(sym);
        if (token) {
            return token;
        }
        token = new TLKeyword(name);
        this.map.set(sym, token);
        return token;
    }

    type: Node.Keyword = Node.Keyword;
    meta?: TLType;

    private constructor(public v: string) {
    }

    withMeta(_meta: TLType): TLKeyword {
        throw new Error(`not supported`);
    }
}

export class TLVector {
    type: Node.Vector = Node.Vector;
    meta?: TLType;

    constructor(public list: TLType[]) {
    }

    withMeta(meta: TLType) {
        const v = new TLVector(this.list);
        v.meta = meta;
        return v;
    }
}

export class TLHashMap {
    type: Node.HashMap = Node.HashMap;
    stringMap: { [key: string]: TLType } = {};
    keywordMap = new Map<TLType, TLType>();
    meta?: TLType;

    constructor(list: TLType[]) {
        while (list.length !== 0) {
            const key = list.shift()!;
            const value = list.shift();
            if (value == null) {
                throw new Error("unexpected hash length");
            }
            if (key.type === Node.Keyword) {
                this.keywordMap.set(key, value);
            } else if (key.type === Node.String) {
                this.stringMap[key.v] = value;
            } else {
                throw new Error(`unexpected key symbol: ${key.type}, expected: keyword or string`);
            }
        }
    }

    withMeta(meta: TLType) {
        const v = this.assoc([]);
        v.meta = meta;
        return v;
    }

    has(key: TLKeyword | TLString) {
        if (key.type === Node.Keyword) {
            return !!this.keywordMap.get(key);
        }
        return !!this.stringMap[key.v];
    }

    get(key: TLKeyword | TLString) {
        if (key.type === Node.Keyword) {
            return this.keywordMap.get(key) || TLNil.instance;
        }
        return this.stringMap[key.v] || TLNil.instance;
    }

    entries(): [TLType, TLType][] {
        const list: [TLType, TLType][] = [];

        this.keywordMap.forEach((v, k) => {
            list.push([k, v]);
        });
        Object.keys(this.stringMap).forEach(v => list.push([new TLString(v), this.stringMap[v]]));

        return list;
    }

    keys(): TLType[] {
        const list: TLType[] = [];
        this.keywordMap.forEach((_v, k) => {
            list.push(k);
        });
        Object.keys(this.stringMap).forEach(v => list.push(new TLString(v)));
        return list;
    }

    vals(): TLType[] {
        const list: TLType[] = [];
        this.keywordMap.forEach(v => {
            list.push(v);
        });
        Object.keys(this.stringMap).forEach(v => list.push(this.stringMap[v]));
        return list;
    }

    assoc(args: TLType[]): TLHashMap {
        const list: TLType[] = [];
        this.keywordMap.forEach((value, key) => {
            list.push(key);
            list.push(value);
        });
        Object.keys(this.stringMap).forEach(keyStr => {
            list.push(new TLString(keyStr));
            list.push(this.stringMap[keyStr]);
        });

        return new TLHashMap(list.concat(args));
    }

    dissoc(args: TLType[]): TLHashMap {
        const newHashMap = this.assoc([]);

        args.forEach(arg => {
            if (arg.type === Node.String) {
                delete newHashMap.stringMap[arg.v];
            } else if (arg.type === Node.Keyword) {
                newHashMap.keywordMap.delete(arg);
            } else {
                throw new Error(`unexpected symbol: ${arg.type}, expected: keyword or string`);
            }
        });
        return newHashMap;
    }
}

type TLF = (...args: (TLType)[]) => TLType;

export class TLFunction {
    static fromLisp(evalTL: (ast: TLType, env: Env) => TLType, env: Env, params: TLSymbol[], bodyAst: TLType): TLFunction {
        const f = new TLFunction();
        f.func = (...args) => evalTL(bodyAst, new Env(env, params, checkUndefined(args)));
        f.env = env;
        f.params = params;
        f.ast = bodyAst;
        f.isMacro = false;

        return f;

        function checkUndefined(args: (TLType | undefined)[]): TLType[] {
            return args.map(arg => {
                if (!arg) {
                    throw new Error(`undefined argument`);
                }
                return arg;
            });
        }
    }

    static fromBootstrap(func: TLF): TLFunction {
        const f = new TLFunction();
        f.func = func;
        f.isMacro = false;

        return f;
    }

    type: Node.Function = Node.Function;
    func!: TLF;
    ast!: TLType
    env!: Env
    params!: TLSymbol[]
    isMacro!: boolean
    meta?: TLType;

    private constructor() { }

    toMacro() {
        const f = new TLFunction();
        f.func = this.func;
        f.ast = this.ast;
        f.env = this.env;
        f.params = this.params;
        f.isMacro = true;
        f.meta = this.meta;

        return f;
    }

    withMeta(meta: TLType) {
        const f = new TLFunction();
        f.func = this.func;
        f.ast = this.ast;
        f.env = this.env;
        f.params = this.params;
        f.isMacro = this.isMacro;
        f.meta = meta;

        return f;
    }

    newEnv(args: TLType[]) {
        return new Env(this.env, this.params, args);
    }
}

export class TLAtom {
    type: Node.Atom = Node.Atom;
    meta?: TLType;

    constructor(public v: TLType) {
    }

    withMeta(meta: TLType) {
        const v = new TLAtom(this.v);
        v.meta = meta;
        return v;
    }
}