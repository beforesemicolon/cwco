"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.getEventHandlerFunction = void 0;
function getEventHandlerFunction(component, nodeData, attribute) {
    var props = Array.from(new Set(__spreadArray(__spreadArray([], Object.getOwnPropertyNames(nodeData)), component.$properties)));
    var values = props.map(function (k) {
        var _a, _b;
        return (_b = (_a = nodeData[k]) !== null && _a !== void 0 ? _a : component[k]) !== null && _b !== void 0 ? _b : null;
    });
    var value = attribute.value.trim();
    var match = value.match(/^(?:((?:this\.)?([a-z$_][a-z0-9$_\\.]*)\s*\((.*)\))|\{(.*)\})$/i);
    var func;
    if (match) {
        var _ = match[0], fn = match[1], fnName = match[2], fnArgs = match[3], executable = match[4];
        if (executable) {
            func = new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0, '$event'], props), ["\"use strict\";\n " + executable + ";"])))();
        }
        else {
            // @ts-ignore
            if (typeof component[fnName] === 'function') {
                fn = fn.replace(/^this\./, '');
                func = new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0, '$event'], props), ["\"use strict\";\n this." + fn])))();
            }
            else {
                func = new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0, '$event'], props), ["\"use strict\";\n " + fn])))();
            }
        }
    }
    else {
        func = new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0, '$event'], props), ["\"use strict\";\n " + value])))();
    }
    return function (event) { return func.call.apply(func, __spreadArray([component, event], values)); };
}
exports.getEventHandlerFunction = getEventHandlerFunction;
