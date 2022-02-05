"use strict";
exports.__esModule = true;
exports.isPrimitive = void 0;
var isPrimitive = function (val) {
    return /number|string|bigint|boolean|symbol/.test(typeof val);
};
exports.isPrimitive = isPrimitive;
