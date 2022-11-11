import { TLType, TLList, TLString, TLNumber, TLBoolean, TLNil, TLKeyword, TLSymbol, TLVector, TLHashMap } from "./types";

export class Reader {
    position = 0;

    constructor(private tokens: string[]) { }

    next(): string {
        const ret = this.peek();
        this.position += 1;
        return ret;
    }

    peek(): string {
        return this.tokens[this.position];
    }
}

export function readStr(input: string): TLType {
    const tokens = tokenizer(input);
    const reader = new Reader(tokens);
    return readForm(reader);
}

export function tokenizer(input: string): string[] {
    const regexp = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    //              1.ignore space and comma 2. create capture group with 5 alternations
    //              3. First alternation: ~@
    //              4. Second alternation: any of all brackets and some symbols [\[\]{}()'`~^@]
    //              5. Third alternation: match any string, non capture group with alternation of either 1 escaped char or negated set of quotes
    //              6. Fourth alternation: semicolon followed by any number of chars
    //              7. Fifth alternation: capture symbol , no brackers of commas,tilde,semicolon
    const tokens: string[] = [];
    while (true) {
        const matches = regexp.exec(input);
        if (!matches) {
            break;
        }
        const match = matches[1];
        if (match === "") {
            break;
        }
        //ignore comments
        if (match[0] !== ";") {
            tokens.push(match);
        }
    }

    return tokens;
}

function readForm(reader: Reader): TLType {
    const token = reader.peek();
    switch (token) {
        case "(":
            return readList(reader);
        case "[":
            return readVector(reader);
        case "{":
            return readHashMap(reader);
        case "'":
            return readSymbol("quote");
        case "`":
            return readSymbol("quasiquote");
        case "~":
            return readSymbol("unquote");
        case "~@":
            return readSymbol("splice-unquote");
        case "@":
            return readSymbol("deref");
        case "^":
        {
            reader.next();
            const sym = TLSymbol.get("with-meta");
            const target = readForm(reader);
            return new TLList([sym, readForm(reader), target]);
        }
        default:
            return readAtom(reader);
    }

    function readSymbol(name: string) {
        reader.next();
        const sym = TLSymbol.get(name);
        const target = readForm(reader);
        return new TLList([sym, target]);
    }
}

function readList(reader: Reader): TLType {
    return readParen(reader, TLList, "(", ")");
}

function readVector(reader: Reader): TLType {
    return readParen(reader, TLVector, "[", "]");
}

function readHashMap(reader: Reader): TLType {
    return readParen(reader, TLHashMap, "{", "}");
}
type Constructor<T> = new (list: T[]) => T;
function readParen(reader: Reader, ctor: Constructor<TLType>, open: string, close: string): TLType {
    const token = reader.next(); // drop open paren
    if (token !== open) {
        throw new Error(`unexpected token ${token}, expected ${open}`);
    }
    const list: TLType[] = [];
    while (true) {
        const next = reader.peek();
        if (next === close) {
            break;
        } else if (!next) {
            throw new Error("unexpected EOF");
        }
        list.push(readForm(reader));
    }
    reader.next(); // drop close paren
    return new ctor(list);
}

export function readAtom(reader: Reader): TLType {
    const token = reader.next();
    if (token.match(/^-?[0-9]+$/)) {
        const v = parseInt(token, 10);
        return new TLNumber(v);
    }
    if (token.match(/^-?[0-9]+\.[0-9]+$/)) {
        const v = parseFloat(token);
        return new TLNumber(v);
    }
    if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
        const v = token.slice(1, token.length - 1)
            .replace(/\\(.)/g, (_, c: string) => c == 'n' ? '\n' : c)
        return new TLString(v);
    }
    if (token[0] === '"') {
        throw new Error("expected '\"', got EOF");
    }
    if (token[0] === ":") {
        return TLKeyword.get(token.substr(1));
    }
    switch (token) {
        case "nil":
            return TLNil.instance;
        case "true":
            return new TLBoolean(true);
        case "false":
            return new TLBoolean(false);
    }

    return TLSymbol.get(token);
}
