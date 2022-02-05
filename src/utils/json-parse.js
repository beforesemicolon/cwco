"use strict";
exports.__esModule = true;
exports.jsonParse = void 0;
function jsonParse(value) {
    if (value && typeof value === 'string') {
        try {
            value = JSON.parse(value.replace(/['`]/g, '"'));
        }
        catch (e) {
        }
    }
    return value;
}
exports.jsonParse = jsonParse;
