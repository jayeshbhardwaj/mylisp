import {tokenizer,readAtom,Reader,readForm} from "../src/reader";
import {TLString, Node, TLType, TLList, TLSymbol} from "../src/types";

//Tokenizer tests

test('Test string tokenizer for valid lisp', () => {
    let tokens:string[] = tokenizer("(+ 2 (* 3 4))");
    expect(tokens.length).toBe(9);
});

//tokenize special characters like ~@
test('Test string tokenizer for first alternation', () => {
    let tokens:string[] = tokenizer("  ~@");
    expect(tokens.length).toBe(1);
});
//Tokenize brackets
test('Test string tokenizer for second alternation', () => {
    let tokens:string[] = tokenizer("  ((");
    expect(tokens.length).toBe(2);
});

//"(?:\\.|[^\\"])*"?
//Tokenize strings
test('Test string tokenizer for third alternation', () => {
    let tokens:string[] = tokenizer("\"\b\b\"");
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"\b\c\b\"");
    console.log(tokens);
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"abc");
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"abc\"");
    expect(tokens.length).toBe(1);
});


//tokenize comments to ignore
test('Test string tokenizer for fourth alternation', () => {
    let tokens:string[] = tokenizer(";djkjgjkd");
    expect(tokens.length).toBe(0);
});

//tokenize symbols
test('Test string tokenizer for fifth alternation', () => {
    let tokens:string[] = tokenizer("symbol function");
    expect(tokens.length).toBe(2);
});


//Read atom tests
test("Read numbers and symbols using read atom", () => {
    expect(readAtom(new Reader(tokenizer("25"))).type).toBe(Node.Number);
    expect(readAtom(new Reader(tokenizer("25ab"))).type).toBe(Node.Symbol)
    expect(readAtom(new Reader(tokenizer("-0.5"))).type).toBe(Node.Number);
    expect(readAtom(new Reader(tokenizer("-0.5ab"))).type).toBe(Node.Symbol);
})

test("Read strings using read atom", () => {
    expect((readAtom(new Reader(tokenizer("\"abc\""))) as TLString).v).toBe("abc");
    //multiline string
    expect((readAtom(new Reader(tokenizer("\"abc\n\""))) as TLString).v).toBe("abc\n");
    expect((readAtom(new Reader(tokenizer("\"abc\ncde\n\""))) as TLString).v).toBe("abc\ncde\n");

    //wrap in function to catch bad string error
    expect(() => {readAtom(new Reader(tokenizer("\"abc")))}).toThrow("expected '\"', got EOF")
})

test("Read keywords/boolean and nil using read atom", () => {
    expect(readAtom(new Reader(tokenizer(":123abc"))).type).toBe(Node.Keyword)
    expect(readAtom(new Reader(tokenizer("true"))).type).toBe(Node.Boolean)
    expect(readAtom(new Reader(tokenizer("false"))).type).toBe(Node.Boolean)
    expect(readAtom(new Reader(tokenizer("nil"))).type).toBe(Node.Nil)
})

//Lisp parser tests - readForm()

test("Basic lisp expression test", () => {
    let expr:TLType = readForm(new Reader(tokenizer("(+ 2 (* 3 4))")))
    console.log(expr)
    expect(expr.type).toBe(Node.List)
    let tlist = (expr as TLList).list
    expect(tlist[0]).toBe(TLSymbol.get("+"))
    //nested
    expect(tlist[2].type).toBe(Node.List)
    expect((tlist[2] as TLList).list[0]).toBe(TLSymbol.get("*"))
})