"use strict";
exports.__esModule = true;
exports.resolveExecutables = void 0;
var evaluate_string_in_component_context_1 = require("./evaluate-string-in-component-context");
var json_stringify_1 = require("../../utils/json-stringify");
function resolveExecutables(str, component, nodeData, executables) {
    var parts = [];
    var lastIndex = 0;
    var isString = true;
    if (executables.length) {
        for (var _i = 0, executables_1 = executables; _i < executables_1.length; _i++) {
            var _a = executables_1[_i], from = _a.from, to = _a.to, executable = _a.executable;
            if (lastIndex !== from) {
                parts.push(str.slice(lastIndex, from));
            }
            lastIndex = to + 1;
            var res = evaluate_string_in_component_context_1.evaluateStringInComponentContext(executable, component, nodeData);
            isString = isString && typeof res === 'string';
            parts.push(res);
        }
        if (lastIndex !== str.length) {
            parts.push(str.slice(lastIndex));
        }
    }
    else {
        parts.push(str);
    }
    if (!isString && parts.length === 1) {
        return parts[0];
    }
    return parts.map(json_stringify_1.jsonStringify).join('');
}
exports.resolveExecutables = resolveExecutables;
