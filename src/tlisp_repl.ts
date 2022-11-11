import {start} from "./readline";
import {readStr} from "./reader";
import {
    isSeq,
    TLFunction,
    TLHashMap,
    TLList,
    TLNil,
    TLNumber,
    TLSymbol,
    TLType,
    TLVector,
    Node
} from "./types";
import {prStr} from "./printer";
import {Env} from "./env";

// READ


function read(str: string): TLType {
    let exp = undefined
    try{
        exp = readStr(str);
    }catch (e) {
        throw ("Bad syntax")
    }
    return exp;
}

// EVAL


function evalAST(ast: TLType, env: Env): TLType {
    switch (ast.type) {
        case Node.Symbol:
            const f = env.get(ast)
            if (!f) {
                throw new Error(`unknown symbol: ${ast.v}`);
            }
            return f;
        case Node.List:
            return new TLList(ast.list.map(ast => evalTL(ast, env)));
        case Node.Vector:
            return new TLVector(ast.list.map(ast => evalTL(ast, env)));
        case Node.HashMap:
            const list: TLType[] = [];
            for (const [key, value] of ast.entries()) {
                list.push(key);
                list.push(evalTL(value, env));
            }
            return new TLHashMap(list);
        default:
            return ast;
    }
}

// EVAL
function evalTL(ast: TLType, env: Env): TLType {
    if (ast.type !== Node.List) {
         return evalAST(ast, env);
    }
    if (ast.list.length === 0) {
        return ast;
    }
    const first = ast.list[0];
    switch (first.type) {
        case Node.Symbol:
            switch (first.v) {
                case "def!": {
                    const [, key, value] = ast.list;
                    if (key.type !== Node.Symbol) {
                        throw new Error(`unexpected toke type: ${key.type}, expected: symbol`);
                    }
                    if (!value) {
                        throw new Error(`unexpected syntax`);
                    }
                    return env.set(key, evalTL(value, env));
                }
                case "let*": {
                    let letEnv = new Env(env);
                    const pairs = ast.list[1];
                    if (!isSeq(pairs)) {
                        throw new Error(`unexpected toke type: ${pairs.type}, expected: list or vector`);
                    }
                    const list = pairs.list;
                    for (let i = 0; i < list.length; i += 2) {
                        const key = list[i];
                        const value = list[i + 1];
                        if (key.type !== Node.Symbol) {
                            throw new Error(`unexpected token type: ${key.type}, expected: symbol`);
                        }
                        if (!key || !value) {
                            throw new Error(`unexpected syntax`);
                        }

                        letEnv.set(key, evalTL(value, letEnv));
                    }
                    return evalTL(ast.list[2], letEnv);
                }
                case "do": {
                    const [, ...list] = ast.list;
                    const ret = evalAST(new TLList(list), env);
                    if (!isSeq(ret)) {
                        throw new Error(`unexpected return type: ${ret.type}, expected: list or vector`);
                    }
                    return ret.list[ret.list.length - 1];
                }
                case "if": {
                    const [, cond, thenExpr, elseExrp] = ast.list;
                    const ret = evalTL(cond, env);
                    let b = true;
                    if (ret.type === Node.Boolean && !ret.v) {
                        b = false;
                    } else if (ret.type === Node.Nil) {
                        b = false;
                    }
                    if (b) {
                        return evalTL(thenExpr, env);
                    } else if (elseExrp) {
                        return evalTL(elseExrp, env);
                    } else {
                        return TLNil.instance;
                    }
                }
                case "fn*": {
                    const [, args, binds] = ast.list;
                    if (!isSeq(args)) {
                        throw new Error(`unexpected return type: ${args.type}, expected: list or vector`);
                    }
                    const symbols = args.list.map(param => {
                        if (param.type !== Node.Symbol) {
                            throw new Error(`unexpected return type: ${param.type}, expected: symbol`);
                        }
                        return param;
                    });
                    return TLFunction.fromBootstrap((...fnArgs: TLType[]) => {
                        return evalTL(binds, new Env(env, symbols, fnArgs));
                    });
                }
            }
    }
    const result = evalAST(ast, env);
    if (!isSeq(result)) {
        throw new Error(`unexpected return type: ${result.type}, expected: list or vector`);
    }
    const [f, ...args] = result.list;
    if (f.type !== Node.Function) {
        throw new Error(`unexpected token: ${f.type}, expected: function`);
    }
    return f.func(...args);
}



// PRINT
function print(exp: TLType): string {
    return prStr(exp);
}

const replEnv = new Env();
replEnv.set(TLSymbol.get("+"),TLFunction.fromBootstrap((a?:TLType,b?:TLType) => new TLNumber((a as TLNumber)!.v + (b as TLNumber)!.v)))
replEnv.set(TLSymbol.get("-"),TLFunction.fromBootstrap((a?:TLType,b?:TLType) => new TLNumber((a as TLNumber)!.v - (b as TLNumber)!.v)))
replEnv.set(TLSymbol.get("/"),TLFunction.fromBootstrap((a?:TLType,b?:TLType) => new TLNumber((a as TLNumber)!.v / (b as TLNumber)!.v)))
replEnv.set(TLSymbol.get("*"),TLFunction.fromBootstrap((a?:TLType,b?:TLType) => new TLNumber((a as TLNumber)!.v * (b as TLNumber)!.v)))
replEnv.set(TLSymbol.get("not"),evalTL(readStr("(def! not (fn* (a) (if a false true)))"),replEnv))
export function rep(str: string): string {
    return print(evalTL(read(str),replEnv));
}

start(rep)
