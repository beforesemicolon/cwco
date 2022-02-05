"use strict";
exports.__esModule = true;
exports.jsonStringify = void 0;
function jsonStringify(value) {
    if (value && typeof value !== 'string') {
        try {
            value = JSON.stringify(value);
        }
        catch (e) {
        }
    }
    return value;
}
exports.jsonStringify = jsonStringify;
