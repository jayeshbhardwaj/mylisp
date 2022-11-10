"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reader_1 = require("../src/reader");
//Tokenizer tests
test('Test string tokenizer for valid lisp', function () {
    var tokens = (0, reader_1.tokenizer)("(+ 2 (* 3 4))");
    expect(tokens.length).toBe(9);
});
//tokenize special characters like ~@
test('Test string tokenizer for first alternation', function () {
    var tokens = (0, reader_1.tokenizer)("  ~@");
    expect(tokens.length).toBe(1);
});
//Tokenize brackets
test('Test string tokenizer for second alternation', function () {
    var tokens = (0, reader_1.tokenizer)("  ((");
    expect(tokens.length).toBe(2);
});
//"(?:\\.|[^\\"])*"?
//Tokenize strings
test('Test string tokenizer for third alternation', function () {
    var tokens = (0, reader_1.tokenizer)("\"\b\b\"");
    expect(tokens.length).toBe(1);
    tokens = (0, reader_1.tokenizer)("\"\b\c\b\"");
    console.log(tokens);
    expect(tokens.length).toBe(1);
    tokens = (0, reader_1.tokenizer)("\"abc");
    expect(tokens.length).toBe(1);
    tokens = (0, reader_1.tokenizer)("\"abc\"");
    expect(tokens.length).toBe(1);
});
//tokenize comments to ignore
test('Test string tokenizer for fourth alternation', function () {
    var tokens = (0, reader_1.tokenizer)(";djkjgjkd");
    expect(tokens.length).toBe(0);
});
//tokenize symbols
test('Test string tokenizer for fifth alternation', function () {
    var tokens = (0, reader_1.tokenizer)("symbol function");
    expect(tokens.length).toBe(2);
});
//Read atom tests
test("Read number using read atom", function () {
    expect((0, reader_1.readAtom)(new reader_1.Reader((0, reader_1.tokenizer)("25"))).type).toBe(2 /* Node.Number */);
    expect((0, reader_1.readAtom)(new reader_1.Reader((0, reader_1.tokenizer)("-.5"))).type).toBe(2 /* Node.Number */);
});
