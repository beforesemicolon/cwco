"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.evaluateStringInComponentContext = void 0;
function evaluateStringInComponentContext(executable, component, nodeData) {
    var _a;
    if (nodeData === void 0) { nodeData = {}; }
    if (!executable.trim()) {
        return '';
    }
    var ctx = component.$context;
    var keys = Array.from(new Set(__spreadArray(__spreadArray(__spreadArray([], Object.getOwnPropertyNames(nodeData)), component.$properties), Object.getOwnPropertyNames(ctx))));
    var values = keys.map(function (key) {
        var _a, _b, _c;
        return (_c = (_b = (_a = nodeData[key]) !== null && _a !== void 0 ? _a : component[key]) !== null && _b !== void 0 ? _b : ctx[key]) !== null && _c !== void 0 ? _c : null;
    });
    return (_a = (new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0], keys), ["\"use strict\";\n return " + executable + ";"])))()).apply(component, values)) !== null && _a !== void 0 ? _a : '';
}
exports.evaluateStringInComponentContext = evaluateStringInComponentContext;
