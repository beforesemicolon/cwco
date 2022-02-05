"use strict";
exports.__esModule = true;
exports.extractExecutableSnippetFromCSS = void 0;
var extract_executable_snippet_from_string_1 = require("./extract-executable-snippet-from-string");
function extractExecutableSnippetFromCSS(css) {
    var pattern = /[\{\}]/g;
    var snippets = [];
    var stack = [];
    var match;
    while ((match = pattern.exec(css)) !== null) {
        var char = match[0];
        if (char === '{') {
            stack.push(match.index);
        }
        else if (char === '}') {
            if (stack.length === 1) {
                snippets.push.apply(snippets, extract_executable_snippet_from_string_1.extractExecutableSnippetFromString(css.slice(stack[0], match.index), ['[', ']'], stack[0]));
            }
            stack.pop();
        }
    }
    return snippets;
}
exports.extractExecutableSnippetFromCSS = extractExecutableSnippetFromCSS;
