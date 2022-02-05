"use strict";
exports.__esModule = true;
exports.turnCamelToKebabCasing = void 0;
function turnCamelToKebabCasing(name) {
    var _a, _b;
    return (_b = (_a = name
        .match(/(?:[A-Z]+(?=[A-Z][a-z])|[A-Z]+|[a-zA-Z])[a-z]*/g)) === null || _a === void 0 ? void 0 : _a.map(function (p) { return p.toLowerCase(); }).join('-')) !== null && _b !== void 0 ? _b : name;
}
exports.turnCamelToKebabCasing = turnCamelToKebabCasing;
