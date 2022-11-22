import {startREPL} from "./readline";
import {readStr} from "./reader";
import * as core from "./core"
import {isSeq, Node, TLFunction, TLHashMap, TLList, TLNil, TLSymbol, TLType, TLVector} from "./types";
import {prStr} from "./printer";
import {Env} from "./env";

// READ



// EVAL


export function evalAST(ast: TLType, env: Env): TLType {
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
export function evalTL(ast: TLType, env: Env): TLType {
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
            break;

        case Node.Keyword:
            if(ast.list.length > 2)
                throw new Error(`Unexpected args, expected only hashmap`)
            if(ast.list[1].type != Node.HashMap)
                throw new Error(`Unexpected token type: ${ast.list[1].type}, expected hashmap`)
            const hmap:TLHashMap = evalAST(ast.list[1],env) as TLHashMap
            let ret = hmap.keywordMap.get(first)
            if(ret == undefined) return TLNil.instance
            else return ret

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

//Setup Env
const replEnv = new Env();
core.ns.forEach((value, key) => {
    replEnv.set(key, value);
});

replEnv.set(TLSymbol.get("eval"), TLFunction.fromBootstrap(ast => {
    if (!ast) {
        throw new Error(`undefined argument`);
    }
    return evalTL(ast, replEnv);
}));

replEnv.set(TLSymbol.get("*ARGV*"), new TLList([]));
export function rep(str: string): string {
    return print(evalTL(readStr(str),replEnv));
}

rep("(def! not (fn* (a) (if a false true)))");
rep("(def! load-file (fn* (f) (eval (read-string (str \"(do \" (slurp f) \"\\nnil)\")))))")
startREPL(rep)
