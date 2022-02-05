"use strict";
exports.__esModule = true;
exports.turnKebabToCamelCasing = void 0;
function turnKebabToCamelCasing(name) {
    var _a;
    return (_a = name
        .split(/-+/)
        .map(function (part, i) { return i === 0 && part.length > 1 ? part : part[0].toUpperCase() + part.slice(1); })
        .join('')) !== null && _a !== void 0 ? _a : name;
}
exports.turnKebabToCamelCasing = turnKebabToCamelCasing;
