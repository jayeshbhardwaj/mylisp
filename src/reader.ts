import {
    TLType,
    TLList,
    TLString,
    TLNumber,
    TLBoolean,
    TLNil,
    TLKeyword,
    TLSymbol,
    TLVector,
    TLHashMap,
    EmptyTokenError
} from "./types";

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
    if(tokens.length == 0) throw new EmptyTokenError('no tokens')
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

export function readForm(reader:Reader):TLType {
    let char = reader.peek()
    switch(char){
        case "(" : return readSeq(reader, TLList, "(", ")")
        case "[" : return readSeq(reader, TLVector, "[", "]")
        case "{" : return readSeq(reader, TLHashMap, "{", "}")
        default : return readAtom(reader);
    }
}
type Constructor<T> = new (list: T[]) => T;

function readSeq(reader:Reader, ctor:Constructor<TLType>, open:string, close:string):TLType {
    let next = reader.next(); // drop open bracket
    if(next != open){
        throw new Error("Unexpected token, expected '('");
    }
    let tlist:TLType[] = [];
    while(true){
        let next = reader.peek()
        if(next == close)
            break;
        else {
            tlist.push(readForm(reader))
        }
    }
    reader.next(); //drop close bracket
    return new ctor(tlist);
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
