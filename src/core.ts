import * as fs from "fs";


import {
    equals,
    isSeq,
    Node,
    TLAtom,
    TLBoolean,
    TLFunction,
    TLHashMap,
    TLKeyword,
    TLList,
    TLNil,
    TLNumber,
    TLString,
    TLSymbol,
    TLType,
    TLVector
} from "./types";
import {readStr} from "./reader";
import {prStr} from "./printer";

export const ns: Map<TLSymbol, TLFunction> = (() => {
    const ns: { [symbol: string]: typeof TLFunction.prototype.func; } = {
        "="(a: TLType, b: TLType): TLBoolean {
            return new TLBoolean(equals(a, b));
        },
        throw(v: TLType): TLType {
            throw v;
        },

        "nil?"(v: TLType) {
            return new TLBoolean(v.type === Node.Nil);
        },
        "true?"(v: TLType) {
            return new TLBoolean(v.type === Node.Boolean && v.v);
        },
        "false?"(v: TLType) {
            return new TLBoolean(v.type === Node.Boolean && !v.v);
        },
        "string?"(v: TLType) {
            return new TLBoolean(v.type === Node.String);
        },
        "trim"(v : TLType){
            if (v.type !== Node.String) {
                throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
            return new TLString(v.v.trim());
        },
        symbol(v: TLType) {
            if (v.type !== Node.String) {
                throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
            return TLSymbol.get(v.v);
        },
        "symbol?"(v: TLType) {
            return new TLBoolean(v.type === Node.Symbol);
        },
        keyword(v: TLType) {
            if (v.type === Node.Keyword) {
                return v;
            }
            if (v.type !== Node.String) {
                throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
            return TLKeyword.get(v.v);
        },
        "keyword?"(v: TLType) {
            return new TLBoolean(v.type === Node.Keyword);
        },
        "number?"(v: TLType) {
            return new TLBoolean(v.type === Node.Number);
        },
        "toInt"(v : TLType){
            if (v.type !== Node.String) {
                return new TLNumber(0);
                //throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
             return new TLNumber(parseInt(v.v));
        },
        "fn?"(v: TLType) {
            return new TLBoolean(v.type === Node.Function && !v.isMacro);
        },
        "macro?"(v: TLType) {
            return new TLBoolean(v.type === Node.Function && v.isMacro);
        },
        "split"(v : TLType, r : TLType){
            if(v.type !== Node.String || r.type !== Node.String)
              throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            const str = v.v
            const pattern = r.v
            const strs:TLString[] = str.split(pattern).map(s => new TLString(s))
            return new TLList(strs)
        },
        "pr-str"(...args: TLType[]): TLString {
            return new TLString(args.map(v => prStr(v, true)).join(" "));
        },
        "str"(...args: TLType[]): TLString {
            return new TLString(args.map(v => prStr(v, false)).join(""));
        },
        prn(...args: TLType[]): TLNil {
            const str = args.map(v => prStr(v, true)).join(" ");
            console.log(str);
            return TLNil.instance;
        },
        println(...args: TLType[]): TLNil {
            const str = args.map(v => prStr(v, false)).join(" ");
            console.log(str);
            return TLNil.instance;
        },
        "read-string"(v: TLType) {
            if (v.type !== Node.String) {
                throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
            return readStr(v.v);
        },
        slurp(v: TLType) {
            if (v.type !== Node.String) {
                throw new Error(`unexpected symbol: ${v.type}, expected: string`);
            }
            const content = fs.readFileSync(v.v, "utf-8");
            return new TLString(content);
        },

        "<"(a: TLType, b: TLType): TLBoolean {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLBoolean(a.v < b.v);
        },
        "<="(a: TLType, b: TLType): TLBoolean {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLBoolean(a.v <= b.v);
        },
        ">"(a: TLType, b: TLType): TLBoolean {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLBoolean(a.v > b.v);
        },
        ">="(a: TLType, b: TLType): TLBoolean {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLBoolean(a.v >= b.v);
        },
        "and"(a:TLType, b:TLType): TLBoolean {
            if(a.type != Node.Boolean || b.type != Node.Boolean)
                throw new Error(`unexpected symbol: ${a.type}, expected: boolean`);
            return new TLBoolean(a.v&&b.v)
        },
        "+"(a: TLType, b: TLType): TLNumber {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLNumber(a.v + b.v);
        },
        "-"(a: TLType, b: TLType): TLNumber {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLNumber(a.v - b.v);
        },
        "*"(a: TLType, b: TLType): TLNumber {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLNumber(a.v * b.v);
        },
        "/"(a: TLType, b: TLType): TLNumber {
            if (a.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${a.type}, expected: number`);
            }
            if (b.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${b.type}, expected: number`);
            }

            return new TLNumber(a.v / b.v);
        },
        "time-ms"() {
            return new TLNumber(Date.now());
        },

        list(...args: TLType[]): TLList {
            return new TLList(args);
        },
        "list?"(v: TLType): TLBoolean {
            return new TLBoolean(v.type === Node.List);
        },
        vector(...args: TLType[]): TLVector {
            return new TLVector(args);
        },
        "vector?"(v: TLType): TLBoolean {
            return new TLBoolean(v.type === Node.Vector);
        },
        "hash-map"(...args: TLType[]) {
            return new TLHashMap(args);
        },
        "map?"(v: TLType): TLBoolean {
            return new TLBoolean(v.type === Node.HashMap);
        },
        assoc(v: TLType, ...args: TLType[]) {
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }
            return v.assoc(args);
        },
        dissoc(v: TLType, ...args: TLType[]) {
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }
            return v.dissoc(args);
        },
        get(v: TLType, key: TLType) {
            if (v.type === Node.Nil) {
                return TLNil.instance;
            }
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }
            if (key.type !== Node.String && key.type !== Node.Keyword) {
                throw new Error(`unexpected symbol: ${key.type}, expected: string or keyword`);
            }

            return v.get(key) || TLNil.instance;
        },
        "contains?"(v: TLType, key: TLType) {
            if (v.type === Node.Nil) {
                return TLNil.instance;
            }
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }
            if (key.type !== Node.String && key.type !== Node.Keyword) {
                throw new Error(`unexpected symbol: ${key.type}, expected: string or keyword`);
            }

            return new TLBoolean(v.has(key));
        },
        keys(v: TLType) {
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }

            return new TLList([...v.keys()]);
        },
        vals(v: TLType) {
            if (v.type !== Node.HashMap) {
                throw new Error(`unexpected symbol: ${v.type}, expected: hash-map`);
            }

            return new TLList([...v.vals()]);
        },

        "sequential?"(v: TLType) {
            return new TLBoolean(isSeq(v));
        },
        cons(a: TLType, b: TLType) {
            if (!isSeq(b)) {
                throw new Error(`unexpected symbol: ${b.type}, expected: list or vector`);
            }

            return new TLList([a].concat(b.list));
        },
        concat(...args: TLType[]) {
            const list = args
                .map(arg => {
                    if (!isSeq(arg)) {
                        throw new Error(`unexpected symbol: ${arg.type}, expected: list or vector`);
                    }
                    return arg;
                })
                .reduce((p, c) => p.concat(c.list), [] as TLType[]);

            return new TLList(list);
        },
        vec(a: TLType) {
            switch (a.type) {
                case Node.List:
                    return new TLVector(a.list);
                case Node.Vector:
                    return a;
            }
            throw new Error(`unexpected symbol: ${a.type}, expected: list or vector`);
        },

        nth(list: TLType, idx: TLType) {
            if (!isSeq(list)) {
                throw new Error(`unexpected symbol: ${list.type}, expected: list or vector`);
            }
            if (idx.type !== Node.Number) {
                throw new Error(`unexpected symbol: ${idx.type}, expected: number`);
            }

            const v = list.list[idx.v];
            if (!v) {
                throw new Error("nth: index out of range");
            }

            return v;
        },
        first(v: TLType) {
            if (v.type === Node.Nil) {
                return TLNil.instance;
            }
            if (!isSeq(v)) {
                throw new Error(`unexpected symbol: ${v.type}, expected: list or vector`);
            }

            return v.list[0] || TLNil.instance;
        },
        rest(v: TLType) {
            if (v.type === Node.Nil) {
                return new TLList([]);
            }
            if (!isSeq(v)) {
                throw new Error(`unexpected symbol: ${v.type}, expected: list or vector`);
            }

            return new TLList(v.list.slice(1));
        },
        "empty?"(v: TLType): TLBoolean {
            if (!isSeq(v)) {
                return new TLBoolean(false);
            }
            return new TLBoolean(v.list.length === 0);
        },
        count(v: TLType): TLNumber {
            if (isSeq(v)) {
                return new TLNumber(v.list.length);
            }
            if (v.type === Node.Nil) {
                return new TLNumber(0);
            }
            throw new Error(`unexpected symbol: ${v.type}`);
        },
        apply(f: TLType, ...list: TLType[]) {
            if (f.type !== Node.Function) {
                throw new Error(`unexpected symbol: ${f.type}, expected: function`);
            }

            const tail = list[list.length - 1];
            if (!isSeq(tail)) {
                throw new Error(`unexpected symbol: ${tail.type}, expected: list or vector`);
            }
            const args = list.slice(0, -1).concat(tail.list);
            return f.func(...args);
        },
        map(f: TLType, list: TLType) {
            if (f.type !== Node.Function) {
                throw new Error(`unexpected symbol: ${f.type}, expected: function`);
            }
            if (!isSeq(list)) {
                throw new Error(`unexpected symbol: ${list.type}, expected: list or vector`);
            }

            return new TLList(list.list.map(v => f.func(v)));
        },
        reduce(f: TLType, list: TLType, init:TLType){
            if (f.type !== Node.Function) {
                throw new Error(`unexpected symbol: ${f.type}, expected: function`);
            }
            if (!isSeq(list)) {
                throw new Error(`unexpected symbol: ${list.type}, expected: list or vector`);
            }
            switch(init.type){
                case Node.String : return list.list.reduce((a,b) => f.func(a,b),new TLString(init.v))
                case Node.Number : return list.list.reduce((a,b) => f.func(a,b),new TLNumber(init.v))
                default : return TLNil.instance
            }
        },
        sort(l : TLType, f : TLType){
          if(!isSeq(l) || f.type != Node.Function)
              throw new Error(`unexpected symbol: ${l.type}, expected: list or vector`);
          const func = (a:TLType,b:TLType) => {const ret = f.func(a,b); if(ret.type != Node.Number) return 0; else return ret.v}
          return new TLList(l.list.sort(func))
        },
        take(l: TLType, n:TLType){
            if(!isSeq(l) || n.type != Node.Number)
                throw new Error(`unexpected symbol: ${l.type}, expected: list or vector`);
          return new TLList(l.list.slice(0,n.v));
        },
        conj(list: TLType, ...args: TLType[]) {
            switch (list.type) {
                case Node.List:
                    const newList = new TLList(list.list);
                    args.forEach(arg => newList.list.unshift(arg));
                    return newList;
                case Node.Vector:
                    return new TLVector([...list.list, ...args]);
            }

            throw new Error(`unexpected symbol: ${list.type}, expected: list or vector`);
        },
        seq(v: TLType) {
            if (v.type === Node.List) {
                if (v.list.length === 0) {
                    return TLNil.instance;
                }
                return v;
            }
            if (v.type === Node.Vector) {
                if (v.list.length === 0) {
                    return TLNil.instance;
                }
                return new TLList(v.list);
            }
            if (v.type === Node.String) {
                if (v.v.length === 0) {
                    return TLNil.instance;
                }
                return new TLList(v.v.split("").map(s => new TLString(s)));
            }
            if (v.type === Node.Nil) {
                return TLNil.instance;
            }

            throw new Error(`unexpected symbol: ${v.type}, expected: list or vector or string`);
        },

        meta(v: TLType) {
            return v.meta || TLNil.instance;
        },
        "with-meta"(v: TLType, m: TLType) {
            return v.withMeta(m);
        },
        atom(v: TLType): TLAtom {
            return new TLAtom(v);
        },
        "atom?"(v: TLType): TLBoolean {
            return new TLBoolean(v.type === Node.Atom);
        },
        deref(v: TLType): TLType {
            if (v.type !== Node.Atom) {
                throw new Error(`unexpected symbol: ${v.type}, expected: atom`);
            }
            return v.v;
        },
        "reset!"(atom: TLType, v: TLType): TLType {
            if (atom.type !== Node.Atom) {
                throw new Error(`unexpected symbol: ${atom.type}, expected: atom`);
            }
            atom.v = v;
            return v;
        },
        "swap!"(atom: TLType, f: TLType, ...args: TLType[]): TLType {
            if (atom.type !== Node.Atom) {
                throw new Error(`unexpected symbol: ${atom.type}, expected: atom`);
            }
            if (f.type !== Node.Function) {
                throw new Error(`unexpected symbol: ${f.type}, expected: function`);
            }
            atom.v = f.func(...[atom.v].concat(args));
            return atom.v;
        },
    };

    const map = new Map<TLSymbol, TLFunction>();
    Object.keys(ns).forEach(key => map.set(TLSymbol.get(key), TLFunction.fromBootstrap(ns[key])));
    return map;
})();
