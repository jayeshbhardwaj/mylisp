import {tokenizer} from "../src/reader";

//Tokenizer tests

test('Test string tokenizer for valid lisp', () => {
    let tokens:string[] = tokenizer("(+ 2 (* 3 4))")
    expect(tokens.length).toBe(9);
});

//tokenize special characters like ~@
test('Test string tokenizer for first alternation', () => {
    let tokens:string[] = tokenizer("  ~@")
    expect(tokens.length).toBe(1);
});
//Tokenize brackets
test('Test string tokenizer for second alternation', () => {
    let tokens:string[] = tokenizer("  ((")
    expect(tokens.length).toBe(2);
});

//"(?:\\.|[^\\"])*"?
//Tokenize strings
test('Test string tokenizer for third alternation', () => {
    let tokens:string[] = tokenizer("\"\b\b\"")
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"\b\c\b\"")
    console.log(tokens);
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"abc")
    expect(tokens.length).toBe(1);
    tokens = tokenizer("\"abc\"")
    expect(tokens.length).toBe(1);
});


//tokenize comments to ignore
test('Test string tokenizer for fourth alternation', () => {
    let tokens:string[] = tokenizer(";djkjgjkd")
    expect(tokens.length).toBe(0);
});

//tokenize symbols
test('Test string tokenizer for fifth alternation', () => {
    let tokens:string[] = tokenizer("symbol function")
    expect(tokens.length).toBe(2);
});
