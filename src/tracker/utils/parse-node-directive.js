"use strict";
exports.__esModule = true;
exports.parseNodeDirective = void 0;
function parseNodeDirective(node, name, value) {
    var dot = name.indexOf('.');
    var prop = null;
    if (dot >= 0) {
        prop = name.slice(dot + 1);
        name = name.slice(0, dot).toLowerCase();
    }
    return { name: name, value: value, prop: prop };
}
exports.parseNodeDirective = parseNodeDirective;
