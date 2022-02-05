"use strict";
exports.__esModule = true;
exports.extractExecutableSnippetFromString = void 0;
function extractExecutableSnippetFromString(str, _a, offset) {
    var _b = _a === void 0 ? ['{', '}'] : _a, start = _b[0], end = _b[1];
    if (offset === void 0) { offset = 0; }
    var stack = [];
    var pattern = new RegExp("[\\" + start + "\\" + end + "]", 'g');
    var snippets = [];
    var match;
    var startingCurlyIndex;
    while ((match = pattern.exec(str)) !== null) {
        var char = match[0];
        if (char === start) {
            stack.push(match.index);
        }
        else if (char === end && stack.length) {
            startingCurlyIndex = stack.pop();
            if (!stack.length) {
                var matchStr = str.slice(startingCurlyIndex + 1, match.index);
                if (matchStr) {
                    for (var j = 0; j < snippets.length; j++) {
                        var snippet = snippets[j];
                        if ((snippet.from - offset) > startingCurlyIndex && (snippet.to - offset) < match.index) {
                            snippets.splice(j, 1);
                        }
                    }
                    snippets.push({
                        from: startingCurlyIndex + offset,
                        to: match.index + offset,
                        match: "" + start + matchStr + end,
                        executable: matchStr
                    });
                }
            }
        }
    }
    return snippets;
}
exports.extractExecutableSnippetFromString = extractExecutableSnippetFromString;
